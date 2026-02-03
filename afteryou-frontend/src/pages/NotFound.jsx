import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md animate-fade-in">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-8">
          <span className="font-serif text-4xl text-muted-foreground">?</span>
        </div>

        {/* Text */}
        <h1 className="font-serif text-4xl text-foreground mb-4">
          Page Not Found
        </h1>

        <p className="text-muted-foreground mb-8">
          The page you're looking for seems to have drifted away, like a letter
          lost in time.
        </p>

        {/* Action */}
        <Button asChild className="rounded-full">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
