interface FeatureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export default function FeatureCard({ title, description, children, className = "" }: FeatureCardProps) {
  return (
    <div className={`select-none w-[320px] h-[480px] sm:h-[576px] sm:w-[384px] bg-gradient-to-b from-zinc-900 to-zinc-800 border border-zinc-800 rounded-xl sm:rounded-2xl flex-1 p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-8 ${className}`}>
      <div>
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm sm:text-base text-zinc-400 mt-2 sm:mt-4 tracking-tight sm:tracking-normal">{description}</p>
      </div>
      <div className="w-full aspect-square rounded-lg">

        {children}
      </div>
    </div>
  );
} 