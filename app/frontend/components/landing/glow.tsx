const Glow = ({ className, background }: {className: string, background: string}) => {
    return (
      <div
        className={`absolute pointer-events-none ${className}`}
        style={{
          background,
          filter: "blur(50px)",
          zIndex: "-1",
        }}
      />
    );
  };
  
  export default Glow;
  