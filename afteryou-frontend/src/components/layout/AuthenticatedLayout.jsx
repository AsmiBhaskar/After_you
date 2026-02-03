import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import PageLoader from "./PageLoader";

const AuthenticatedLayout = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Navigation Sidebar */}
      <Navigation />

      {/* Main Content */}
      <main className="relative min-h-screen pt-16 px-4 md:px-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
