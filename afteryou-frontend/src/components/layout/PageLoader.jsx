import { useEffect, useState } from "react";

const PageLoader = ({ message = "Loading..." }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl animate-breathe" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 animate-glow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-primary"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Floating particles */}
          <div
            className="absolute -top-4 -right-4 h-2 w-2 rounded-full bg-primary/30 animate-float"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute -bottom-2 -left-6 h-3 w-3 rounded-full bg-accent/40 animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 -right-8 h-1.5 w-1.5 rounded-full bg-primary/20 animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Text */}
        <div className="space-y-2 text-center">
          <h2 className="font-serif text-2xl text-foreground/80">
            {message}
            <span className="inline-block w-6 text-left">{dots}</span>
          </h2>
          <p className="text-sm italic text-muted-foreground">
            “Our words should outlive our silence”
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full animate-shimmer bg-gradient-to-r from-primary/50 via-primary to-primary/50"
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
