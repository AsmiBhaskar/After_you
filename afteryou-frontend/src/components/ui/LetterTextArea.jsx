import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const LetterTextarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      {/* Vintage paper background */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(40 35% 96%) 0%, 
              hsl(38 30% 94%) 100%
            )
          `,
          boxShadow: `
            inset 0 2px 10px hsl(35 20% 80% / 0.5),
            0 4px 20px hsl(30 20% 20% / 0.08)
          `,
        }}
      />

      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Lined paper effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              transparent,
              transparent 31px,
              hsl(35 30% 85% / 0.4) 31px,
              hsl(35 30% 85% / 0.4) 32px
            )
          `,
          backgroundPosition: "0 16px",
        }}
      />

      {/* Left margin line */}
      <div
        className="absolute top-0 bottom-0 left-10 w-px pointer-events-none"
        style={{ background: "hsl(0 40% 75% / 0.3)" }}
      />

      {/* The actual textarea */}
      <textarea
        className={cn(
          "relative w-full min-h-[300px] px-14 py-6 bg-transparent",
          "font-serif text-lg leading-[32px] text-foreground",
          "placeholder:text-muted-foreground/50 placeholder:italic",
          "border-none outline-none resize-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "rounded-xl",
          className,
        )}
        ref={ref}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: "0.02em",
        }}
        {...props}
      />

      {/* Corner fold effect */}
      <div
        className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              135deg,
              transparent 50%,
              hsl(35 25% 88%) 50%,
              hsl(35 20% 85%) 100%
            )
          `,
          borderRadius: "0 0 12px 0",
          boxShadow: "-2px -2px 6px hsl(30 20% 20% / 0.05)",
        }}
      />

      {/* Subtle aged edges */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 0 1px hsl(35 20% 80% / 0.5),
            inset 0 -3px 8px hsl(35 30% 75% / 0.2)
          `,
        }}
      />
    </div>
  );
});

LetterTextarea.displayName = "LetterTextarea";

export { LetterTextarea };
