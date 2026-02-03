import { cn } from "@/lib/utils";

const TimeCapsule = ({ children, className, title, subtitle }) => {
  return (
    <div
      className={cn(
        "relative bg-gradient-to-b from-card to-secondary/30 rounded-2xl p-8 overflow-hidden",
        "shadow-envelope",
        className,
      )}
    >
      {/* Top light gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(35 60% 95% / 0.3), transparent 70%)",
        }}
      />

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-foreground">
          <path
            d="M100 0 L100 100 L0 100 C50 100 100 50 100 0"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h3 className="font-serif text-2xl text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default TimeCapsule;
