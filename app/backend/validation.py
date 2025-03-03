import re
import contextlib
from math import isclose
from typing import Union
import sympy
from sympy.parsing.latex import parse_latex
from sympy.parsing.sympy_parser import parse_expr
import asyncio
from backend.models import Cohere
from enum import Enum
from sympy import Eq, simplify, symbols, cancel


class Equality(Enum):
    EQUAL = 1
    UNEQUAL = 0
    FAILED = -1


class ValidationObject:
    stages = ["string", "math", "brackets", "matrices", "symbolic", "llm"]

    def __init__(self):
        self.counter = 0
        self.state = []
        self.status = Equality.FAILED

    def _populate_info(self, idx: int, stage: str):
        for i in range(idx):
            reason = "not equal" if i == 0 else "failed"
            self.state.append(
                {"type": f"{self.stages[i]} comparison", "reason": reason}
            )

    def _add_stage(self, stage: str, msg: str):
        assert (
            stage in ValidationObject.stages
        ), f"Value Error: stage {stage} does not exist"

        idx = ValidationObject.stages.index(stage)
        self._populate_info(idx, stage)
        self.state.append({"type": f"{self.stages[idx]} comparison", "reason": msg})

    def add_equal(self, stage: str, info: str = ""):
        info = f" {info}" if info else info
        self._add_stage(stage, f"success{info}")
        self.status = Equality.EQUAL

    def add_unequal(self, stage: str, info: str = ""):
        info = f" {info}" if info else info
        self._add_stage(stage, f"not equal{info}")
        self.status = Equality.UNEQUAL


def safe_execution(default_return=None, catch_exceptions=(Exception,)):
    """
    Decorator factory to catch exceptions and return a default value instead of failing.

    :param default_return: The value to return in case of an exception.
    :param catch_exceptions: Tuple of exception classes to catch.
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except catch_exceptions:
                return default_return

        return wrapper

    return decorator


class LLMAnswerComparator:
    def __init__(self, tolerance: float = 1e-4):
        self.tolerance = tolerance

    def _fix_fracs(self, string: str) -> str:
        # Replace extra spaces in \frac commands.
        while "\\frac " in string:
            string = string.replace("\\frac ", "\\frac")
        substrs = string.split("\\frac")
        new_str = substrs[0]
        if len(substrs) > 1:
            for substr in substrs[1:]:
                new_str += "\\frac"
                if substr and substr[0] == "{":
                    new_str += substr
                else:
                    if len(substr) < 2:
                        return string  # early exit if not as expected
                    a, b = substr[0], substr[1]
                    if b != "{":
                        if len(substr) > 2:
                            post_substr = substr[2:]
                            new_str += "{" + a + "}{" + b + "}" + post_substr
                        else:
                            new_str += "{" + a + "}{" + b + "}"
                    else:
                        if len(substr) > 2:
                            post_substr = substr[2:]
                            new_str += "{" + a + "}" + b + post_substr
                        else:
                            new_str += "{" + a + "}" + b
        return new_str

    def _str_is_int(self, x: str) -> bool:
        try:
            x = self._strip_properly_formatted_commas(x)
            x = float(x)
            return abs(x - int(round(x))) <= 1e-7
        except (ValueError, AssertionError):
            return False

    def _str_to_int(self, x: str) -> int:
        x = x.replace(",", "")
        if "_" in x:
            x = x.split("_")[0]  # due to base notation
        return int(float(x))

    def _inject_implicit_mixed_number(self, step: str) -> str:
        """
        Convert mixed numbers like '7 3/4' to '7+3/4'
        """
        p1 = re.compile(r"([0-9]) +([0-9])")
        return p1.sub(r"\1+\2", step)

    def _strip_properly_formatted_commas(self, expr: str) -> str:
        p1 = re.compile(r"(\d)(,)(\d\d\d)($|\D)")
        while True:
            next_expr = p1.sub(r"\1\3\4", expr)
            if next_expr == expr:
                break
            expr = next_expr
        return next_expr

    def _remove_right_units(self, expr: str) -> str:
        # Remove any trailing text units introduced via \text{ ... } or \mbox{...}
        if "\\text" in expr:
            splits = re.split(r"\\text\s*{\s*", expr)
            if len(splits) == 2 and splits[0] not in ("", "("):
                return splits[0]
        if "\\text{" in expr:
            return re.sub(r"\\text{([^}]+)}", r"\1", expr)
        elif "\\mbox{" in expr:
            splits = expr.split("\\mbox{")
            if len(splits) == 2:
                return splits[0]
        return expr

    def _process_and_or_inside_text(self, string: str) -> str:
        string = re.sub(r"\s*\\text{\s*(or|and)\s*}\s*", ",", string)
        return re.sub(r",\s*,", ",", string)

    def _remove_left_and_right(self, expr: str) -> str:
        return re.sub(r"\\left|\\right", "", expr)

    def _fix_sqrt(self, string: str) -> str:
        return re.sub(r"\\sqrt(\s*\w+)", r"\\sqrt{\1}", string)

    def _fix_interval(self, expr: str) -> str:
        if "\\in " in expr:
            return expr.split("\\in ")[1].strip()
        return expr

    def _inject_implicit_mixed_fraction(self, step: str) -> str:
        """
        Convert mixed numbers like '7 \\frac{3}{4}' to '7+3/4'
        """
        p1 = re.compile(r"(\d+)\s*\\frac{(\d+)}{(\d+)}")

        def replacer(match):
            whole_part = match.group(1)
            numerator = match.group(2)
            denominator = match.group(3)
            return f"{whole_part}+{numerator}/{denominator}"

        return p1.sub(replacer, step)

    def normalize_answer_string(self, expr: str) -> str:
        """Normalize an answer expression."""
        if expr is None:
            return None

        expr = self._remove_left_and_right(expr)
        expr = self._process_and_or_inside_text(expr)
        expr = self._remove_right_units(expr)
        expr = self._fix_interval(expr)

        # Remove additional LaTeX formatting commands.
        for surround_str in [
            "\\\\text",
            "\\\\mathrm",
            "\\\\mathcal",
            "\\\\textbf",
            "\\\\textit",
        ]:
            expr = expr.replace(surround_str, "")
            pattern = f"^{surround_str}" + r"\{(?P<text>.+?)\}$"
            m = re.search(pattern, expr)
            if m:
                expr = m.group("text")

        expr = expr.replace("\!", "").replace("\\%", "%")
        expr = expr.replace("\\$", "$").replace("$", "")
        expr = expr.replace("%", "").replace("^{\\circ}", "")
        expr = expr.replace(" or ", " , ").replace(" and ", " , ")
        expr = (
            expr.replace("million", "*10^6")
            .replace("billion", "*10^9")
            .replace("trillion", "*10^12")
        )
        for unit in [
            "degree",
            "cm",
            "centimeter",
            "meter",
            "mile",
            "second",
            "minute",
            "hour",
            "week",
            "month",
            "year",
            "foot",
            "feet",
            "inch",
            "yard",
            "p.m.",
            "PM",
        ]:
            expr = re.sub(f"{unit}(es)?(s)?\s*(\^[0-9]+)?", "", expr)

        if "day" in expr:
            days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]
            if not any(day in expr for day in days):
                expr = re.sub("day(s)?", "", expr)

        expr = re.sub(r"\^ *\\circ", "", expr)

        if expr.startswith("{") and expr.endswith("}"):
            expr = expr[1:-1]

        expr = self._fix_sqrt(expr)
        expr = self._fix_fracs(expr)
        expr = re.sub(r"-\s*", "-", expr)
        expr = self._inject_implicit_mixed_number(expr)
        expr = self._inject_implicit_mixed_fraction(expr)
        expr = expr.replace(" ", "")

        if self._str_is_int(expr):
            expr = str(self._str_to_int(expr))
        return expr

    def is_digit(self, s: str) -> (bool, Union[float, None]):
        try:
            if "{,}" in s:
                num = float(s.replace("{,}", ""))
                return True, num
            num = float(s.replace(",", ""))
            return True, num
        except ValueError:
            return False, None

    def normalize(self, answer: Union[str, float, bool]) -> str:
        if isinstance(answer, str) and re.match(r"\$\d+(\.\d+)?", answer):
            return answer[1:]
        if isinstance(answer, str) and (
            re.match(r"^\d+(\.\d+)?%$", answer) or re.match(r"^\d+(\.\d+)?\\%$", answer)
        ):
            return answer.replace("\\%", "").replace("%", "")
        return str(answer)

    def _compare_bracketed_expressions(self, a: str, b: str) -> bool:
        """
        Compare expressions enclosed in brackets (e.g. [x,y] vs (x,y))".
        """

        def strip_enclosing(s: str) -> str:
            s = s.strip()
            if len(s) >= 2 and s[0] in "([{" and s[-1] in ")]}":
                return s[1:-1].strip()
            return s.strip()

        a_stripped = strip_enclosing(a)
        b_stripped = strip_enclosing(b)

        if "," in a_stripped or "," in b_stripped:
            parts_a = [x.strip() for x in a_stripped.split(",")]
            parts_b = [x.strip() for x in b_stripped.split(",")]
            if len(parts_a) == len(parts_b):
                return all(
                    self._llm_answers_equivalent(xa, xb).status == Equality.EQUAL
                    for xa, xb in zip(parts_a, parts_b)
                )
        return a_stripped == b_stripped

    def _try_parse_sympy(self, s: str):
        """Attempt to parse string s using parse_expr and parse_latex."""
        for parse_fn in (parse_expr, parse_latex):
            try:
                return parse_fn(s)
            except Exception:
                continue
        return None

    @safe_execution()
    def check_difference(self, expr_a, expr_b):
        return sympy.simplify(expr_a - expr_b) == 0

    @safe_execution()
    def check_equality(self, expr_a, expr_b):
        return sympy.Eq(expr_a, expr_b).simplify() is True

    @safe_execution(default_return=False)
    def check_close(self, expr_a, expr_b):
        return isclose(
            float(sympy.N(expr_a)), float(sympy.N(expr_b)), rel_tol=self.tolerance
        )

    def _symbolic_equal(self, a: str, b: str) -> bool:
        """Check if two expressions are symbolically equivalent using sympy."""

        expr_a = self._try_parse_sympy(a)
        expr_b = self._try_parse_sympy(b)

        if expr_a is None or expr_b is None:
            return Equality.FAILED
        diff_check = self.check_difference(expr_a, expr_b)
        if diff_check:
            return Equality.EQUAL

        equal_check = self.check_equality(expr_a, expr_b)
        if equal_check:
            return Equality.EQUAL

        if isinstance(expr_a, Eq) and isinstance(expr_b, Eq):
            lhs_a, rhs_a = expr_a.lhs - expr_a.rhs, 0
            lhs_b, rhs_b = expr_b.lhs - expr_b.rhs, 0

            if simplify(lhs_a - lhs_b) == 0:
                return Equality.EQUAL

            ratio = cancel(lhs_a / lhs_b)
            if ratio.is_number:
                return Equality.EQUAL
            return Equality.UNEQUAL
        return Equality.EQUAL if self.check_close(expr_a, expr_b) else Equality.UNEQUAL

    def _parse_matrix(self, expr: str):
        """
        Attempt to parse a matrix expression from LaTeX or sympy.Matrix format.
        """
        latex_match = re.search(
            r"\\begin\{(pmatrix|bmatrix|vmatrix|Bmatrix|matrix)\}(.*?)\\end\{\1\}",
            expr,
            re.DOTALL,
        )
        if latex_match:
            content = latex_match.group(2).strip()
            rows = re.split(r"\\\\+", content)
            matrix_rows = []
            for row in rows:
                row = row.strip()
                if row:
                    cols = [self.normalize_answer_string(col) for col in row.split("&")]
                    parsed_cols = []
                    for col in cols:
                        try:
                            parsed_cols.append(float(col))
                        except ValueError:
                            parsed_val = self._try_parse_sympy(col)
                            if parsed_val is not None:
                                parsed_cols.append(parsed_val)
                            else:
                                raise ValueError(
                                    f"Failed to parse matrix element: {col}"
                                )
                    matrix_rows.append(parsed_cols)
            return sympy.Matrix(matrix_rows)
        parsed = self._try_parse_sympy(expr)
        if isinstance(parsed, sympy.Matrix):
            return parsed
        raise ValueError("Matrix parsing failed.")

    def _compare_matrices(self, a: str, b: str) -> bool:
        """
        Compare two matrices (from LaTeX or sympy format) elementwise.
        """
        try:
            mat_a = self._parse_matrix(a)
            mat_b = self._parse_matrix(b)
        except Exception:
            return False

        if mat_a.equals(mat_b):
            return True

        try:
            return all(
                isclose(
                    float(sympy.N(mat_a[i, j])),
                    float(sympy.N(mat_b[i, j])),
                    rel_tol=self.tolerance,
                )
                for i in range(mat_a.shape[0])
                for j in range(mat_a.shape[1])
            )
        except Exception:
            return False

    async def llm_check(self, ans1: str, ans2: str) -> Equality:
        """Use LLM to check equivalence as last resort"""
        model = Cohere()

        prompt = f"Evaluate the values within expression 1: <{ans1}> and expression 2: <{ans2}>. Show your steps. It does not matter if the format is different, just tell me if the final value is numerically equal."
        response = await model.call_model(
            prompt,
            preamble="You are an examinator and need to decide if 2 answers are equivalent in value. Show your steps and at the end reply with exactly 'Decision: yes' or 'Decision: no'",
            accept_func=lambda x: any(s in x.lower().split('decision:')[1].strip() for s in ['yes', 'no']),
            temperature=1,
        )
        return Equality.EQUAL if "yes" in response.lower().split('decision:')[1].strip() else Equality.UNEQUAL

    def format_intervals(self, prediction: str) -> str:
        patterns = {
            "Interval(": r"^Interval\((.*)\)$",
            "Interval.Ropen(": r"^Interval\.Ropen\((.*)\)$",
            "Interval.Lopen(": r"^Interval\.Lopen\((.*)\)$",
            "Interval.open(": r"^Interval\.open\((.*)\)$",
        }
        for key, pattern in patterns.items():
            match = re.match(pattern, prediction)
            if match:
                inner_content = match.group(1)
                if key == "Interval(":
                    return f"[{inner_content}]"
                elif key == "Interval.Ropen(":
                    return f"[{inner_content})"
                elif key == "Interval.Lopen(":
                    return f"({inner_content}]"
                elif key == "Interval.open(":
                    return f"({inner_content})"
        return prediction

    def extract_answer(
        self,
        string: str,
        extract_from_boxed: bool = True,
        extract_regex: Union[str, list] = None,
    ) -> str:
        """
        Extract the answer from a LaTeX \\boxed or natural language string.
        """
        if "boxed" not in string and "fbox" not in string:
            if extract_regex is None:
                extract_regex = [
                    r"(?i)(?:the\s+)?(?:final\s+)?(?:answer|result)(?:\s*(?:[:\-]|is)\s*)(.+)$"
                ]
            elif isinstance(extract_regex, str):
                extract_regex = [extract_regex]
            for regex in extract_regex:
                match = re.search(regex, string)
                if match:
                    return match.group(1).strip()
            return string

        idx = string.rfind("\\boxed")
        if idx < 0:
            idx = string.rfind("\\fbox")
        i = idx
        num_left_braces_open = 0
        right_brace_idx = None
        while i < len(string):
            if string[i] == "{":
                num_left_braces_open += 1
            if string[i] == "}":
                num_left_braces_open -= 1
                if num_left_braces_open == 0:
                    right_brace_idx = i
                    break
            i += 1

        if right_brace_idx is None:
            return string

        retval = string[idx : right_brace_idx + 1]
        left = "\\boxed{"
        if retval.startswith(left) and retval.endswith("}"):
            return retval[len(left) : -1].strip()
        return string

    def extract_and_normalize(
        self, ans1: Union[str, float, bool], ans2: Union[str, float, bool]
    ) -> tuple[str]:
        ans1 = self.extract_answer(ans1)
        ans2 = self.extract_answer(ans2)
        a = self.normalize_answer_string(ans1)
        b = self.normalize_answer_string(ans2)
        return a, b

    def _llm_answers_equivalent(
        self, ans1: Union[str, float, bool], ans2: Union[str, float, bool]
    ) -> ValidationObject:
        """
        Check whether two LLM-generated answers are essentially equivalent. Doesn't include final LLM check. Return equality and status
        """
        validation = ValidationObject()
        # Extract answers if wrapped in boxes or labeled.
        a, b = self.extract_and_normalize(ans1, ans2)

        if a.lower().strip() == b.lower().strip():
            validation.add_equal("string")
            return validation
        a_is_num, a_val = self.is_digit(a)
        b_is_num, b_val = self.is_digit(b)
        if a_is_num and b_is_num:
            is_close = isclose(a_val, b_val, rel_tol=self.tolerance)
            val_method = validation.add_equal if is_close else validation.add_unequal
            val_method("math")
            return validation

        a = self.format_intervals(a)
        b = self.format_intervals(b)

        if self._compare_bracketed_expressions(a, b):
            validation.add_equal("brackets")
            return validation

        if self._compare_matrices(a, b):
            validation.add_equal("matrices")
            return validation

        symbolic = self._symbolic_equal(a, b)

        if symbolic == Equality.EQUAL:
            validation.add_equal("symbolic")
        else:
            validation.add_unequal("symbolic")

        return validation

    async def llm_answers_equivalent_full(
        self, ans1: Union[str, float, bool], ans2: Union[str, float, bool]
    ) -> bool:
        """
        Check whether two LLM-generated answers are essentially equivalent. Doesn't include final LLM check.
        """
        # NOTE: sometimes sympy parses even though its meaningless
        validation = self._llm_answers_equivalent(ans1, ans2)
        # we are not confident in UNEQUAL value so dont set it
        if validation.status != Equality.FAILED and not (
            validation.status == Equality.UNEQUAL
            and validation.state[-1]["type"] == "symbolic comparison"
        ):
            return validation
        # must clear it because of above reason
        validation = ValidationObject()
        final = await self.llm_check(ans1, ans2)
        if final == Equality.EQUAL:
            validation.add_equal("llm")
        else:
            validation.add_unequal("llm")
        return validation


# ---------------------- Example Usage ----------------------
if __name__ == "__main__":

    comparator = LLMAnswerComparator(tolerance=1e-5)
    examples = [
        # Fraction vs. number.
        # ("\\frac{10}{2}", "5"),
        # # Mixed fraction (implicit plus).
        # ("7 \\frac{3}{4}", "7.75"),
        # # Interval representations.
        # ("Interval.open(1, 2)", "(1,2)"),
        # # Point representation.
        # ("Point(2,3)", "(2,3)"),
        # # Symbolic expressions.
        # ("x + x", "2*x"),
        # # Bracketed lists.
        # ("{  10, 20 }", "[10,20]"),
        # # Numeric tolerance.
        # ("(2.000001)", "(2.0)"),
        # # Matrix examples: LaTeX vs. Matrix(...)
        # (r"\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}", "Matrix([[1,2],[3,4]])"),
        ("The expression is 4.3", "The expression is 2 + 2.3"),
        # ("5+3", "8"),
        # ("2", "2.05"),
    ]
    # print(comparator._symbolic_equal('(1, 2)', '(1,2)'))
    for i, (ansA, ansB) in enumerate(examples, 1):
        eq = asyncio.run(comparator.llm_answers_equivalent_full(ansA, ansB))
        print(eq.status)
        print(eq.state)
        print(f"Example {i}: '{ansA}' vs. '{ansB}' => {eq}")
