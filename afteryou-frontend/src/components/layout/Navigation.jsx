import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  Home,
  Mail,
  Link2,
  Lock,
  Settings,
  LogOut,
  PenLine,
  Activity,
} from "lucide-react";

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/messages", label: "Messages", icon: Mail },
    { path: "/messages/create", label: "Write Message", icon: PenLine },
    { path: "/chains", label: "Legacy Chains", icon: Link2 },
    { path: "/digital-locker", label: "Digital Locker", icon: Lock },
    { path: "/settings", label: "Settings", icon: Settings },
    ...(user?.role === "admin"
      ? [{ path: "/system", label: "System Monitor", icon: Activity }]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle navigation"
        className={cn(
          "fixed top-4 left-4 z-50 h-12 w-12 rounded-full bg-card/80 backdrop-blur shadow-letter",
          isOpen && "bg-transparent shadow-none",
        )}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-80 bg-card shadow-envelope transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="pt-20 px-6 pb-8 border-b border-border">
            <Link to="/dashboard">
              <h1 className="font-serif text-3xl">AfterYou</h1>
              <p className="text-sm text-muted-foreground italic">
                Words that outlive silence
              </p>
            </Link>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 transition",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User / Logout */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="text-sm">
              <p className="font-medium">{user?.username}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
