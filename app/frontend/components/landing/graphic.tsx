import { motion } from "framer-motion";

const rectangles = [
  { id: 1, color: "bg-white/75", border: "border-white" },
  { id: 2, color: "bg-emerald-900/50", border: "border-emerald-300" },
  { id: 3, color: "bg-emerald-900/50", border: "border-emerald-300" },
  { id: 4, color: "bg-emerald-900/50", border: "border-emerald-300" },
];

export default function SkewedStack() {
  return (
    <div className="relative my-10 md:my-20">
      {/* Mobile/Tablet Layout (diagonal without skew) */}
      <div className="md:hidden relative h-[400px] w-full">
        {rectangles.map((rect, index) => (
          <motion.div
            key={rect.id}
            className={`
              absolute w-[40%] h-[196px] sm:h-[240px] sm:min-h-[240px] sm:max-h-[240px]
              border ${rect.border} ${rect.color}
              drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] 
              rounded-xl
            `}
            initial={{ y: 0 }}
            whileHover={{ y: -40 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{
              backdropFilter: "blur(3px)",
              top: `${index * 15}%`,
              left: `${index * 20}%`,
              zIndex: rectangles.length - index,
            }}
          />
        ))}
      </div>

      {/* Desktop Layout (skewed stack) */}
      <div className="hidden md:flex items-center justify-center">
        {rectangles.map((rect, index) => (
          <motion.div
            key={rect.id}
            className={`
              w-[17rem] h-[17rem] lg:w-[20rem] lg:h-[20rem] border ${rect.border} ${rect.color}
              drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] 
              rounded-tl-[1.25rem] rounded-br-[1.25rem] 
              rounded-tr-[2rem] rounded-bl-[2rem]
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
          />
        ))}
      </div>
    </div>
  );
}
