import pytest
from backend.exam import Exam


@pytest.fixture
def exam():
    return Exam()


@pytest.fixture
def question():
    return "What is 5 * 5?"


@pytest.fixture
def answers():
    return {
        "25": 90.0,
        "30": 5.0,
        "20": 5.0
    }


def test_add_question(exam, question):
    exam.add_question(question)
    assert question in exam.get_question()


def test_get_question_by_index(exam, question):
    exam.add_question(question)
    assert exam.get_question(0) == question


def test_get_question_out_of_range(exam):
    with pytest.raises(IndexError):
        exam.get_question(99)


def test_add_answers_and_get_best_answer(exam, question, answers):
    exam.add_question(question)
    exam.add_answers(question, answers)
    assert exam.get_best_answer(question) == "25"


def test_get_all_answers(exam, question, answers):
    exam.add_question(question)
    exam.add_answers(question, answers)
    all_answers = exam.get_all_answers(question)
    assert all_answers == answers


def test_get_confidence_for_answer(exam, question, answers):
    exam.add_question(question)
    exam.add_answers(question, answers)
    confidence = exam.get_confidence(question, "25")
    assert confidence == 90.0


def test_add_answers_to_unknown_question_does_not_crash(exam, answers):
    exam.add_answers("Unknown question", answers)
    assert exam.get_all_answers("Unknown question") is None


def test_add_answers_empty_does_not_crash(exam, question):
    exam.add_question(question)
    exam.add_answers(question, {})
    assert exam.get_all_answers(question) is None
