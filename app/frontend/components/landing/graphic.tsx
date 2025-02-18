import { motion } from "framer-motion";

const rectangles = [
  { id: 1, color: "bg-white/75", border: "border-white" },
  { id: 2, color: "bg-emerald-900/50", border: "border-emerald-300" },
  { id: 3, color: "bg-emerald-900/50", border: "border-emerald-300" },
  { id: 4, color: "bg-emerald-900/50", border: "border-emerald-300" },
];

export default function SkewedStack() {
  return (
    <div className="relative flex items-center justify-center my-16">
      {rectangles.map((rect, index) => (
        <motion.div
          key={rect.id}
          className={`
            w-[14rem] h-[14rem] sm:w-[15rem] sm:h-[15rem] md:w-[16rem] md:h-[16rem] lg:w-[20rem] lg:h-[20rem] border ${rect.border} ${rect.color}
            drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] 
            rounded-tl-[1.25rem] rounded-br-[1.25rem] 
            rounded-tr-[2rem] rounded-bl-[2rem]
            ${rect.id === 4 ? "hidden sm:block" : ""}
          `}
          initial={{ y: 0 }}
          whileHover={{ y: -50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            pointerEvents: "auto",
            marginLeft: index === 0 ? 0 : -180,
            zIndex: rectangles.length - index,
            backdropFilter: "blur(3px)",
            position: "relative",
          }}
          transformTemplate={(latest, generated) =>
            `skewX(-36deg) skewY(14deg) ${generated}`
          }
        >
          {/* <img
            src={`${rect.id}.png`}
            alt="Text line background"
            className="absolute inset-0 object-cover object-center"
          /> */}
        </motion.div>
      ))}
    </div>
  );
}
