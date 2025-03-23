interface FeatureCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export default function FeatureCard({ title, description, children, className = "" }: FeatureCardProps) {
  return (
    <div className={`select-none w-[320px] h-[480px] sm:h-[544px] sm:w-[384px] bg-gradient-to-b from-zinc-900 to-zinc-800 border border-zinc-800 rounded-xl sm:rounded-2xl flex-1 p-4 sm:p-6 flex flex-col justify-between gap-8 sm:gap-12 ${className}`}>
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
        <p className="font-light sm:font-normal text-sm text-zinc-400 mt-1.5 sm:mt-2.5">{description}</p>
      </div>
      <div className="w-full aspect-square rounded-lg">
        {children}
      </div>
    </div>
  );
} 