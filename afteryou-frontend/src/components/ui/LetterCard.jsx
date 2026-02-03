import { cn } from "@/lib/utils";

const LetterCard = ({
  children,
  className,
  onClick,
  hoverable = true,
  sealed = false,
}) => {
  return (
    <div
      className={cn(
        "relative bg-card rounded-xl p-6 transition-all duration-500 ease-out",
        "shadow-letter",
        hoverable &&
          "hover:shadow-envelope hover:-translate-y-1 cursor-pointer",
        sealed && "overflow-hidden",
        className,
      )}
      onClick={onClick}
    >
      {sealed && (
        <>
          {/* Wax seal */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-destructive/80 shadow-md flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-destructive/50" />
          </div>

          {/* Paper texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}
      {children}
    </div>
  );
};

export default LetterCard;
