import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  ChevronDown,
  Globe,
  LayoutDashboard,
  Building2,
  Shield,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

const views = [
  {
    label: "Donor (Public)",
    path: "/",
    icon: Globe,
    desc: "Landing page & campaigns",
  },
  {
    label: "Campaign Creator",
    path: "/creator",
    icon: LayoutDashboard,
    desc: "Create & manage campaigns",
  },
  {
    label: "Hospital Admin",
    path: "/admin",
    icon: Building2,
    desc: "Manage invoices & disbursements",
  },
  {
    label: "Super Admin",
    path: "/super-admin",
    icon: Shield,
    desc: "Review payouts & hospitals",
  },
];

const getViewForPath = (path) => {
  if (path.startsWith("/creator") || path.startsWith("/create"))
    return views[1];
  if (path.startsWith("/admin")) return views[2];
  if (path.startsWith("/super-admin")) return views[3];
  return views[0];
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const currentView = getViewForPath(location.pathname);

  const handleStartCampaign = () => {
    navigate(isAuthenticated ? "/create" : "/login");
    setMobileOpen(false); // Ensure mobile menu closes on navigation
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="size-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">
              TrustBridge
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/campaigns"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Campaigns
            </Link>

            {/* Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-slate-200 text-sm font-medium gap-2"
                >
                  <currentView.icon className="size-3.5 text-emerald-600" />
                  {currentView.label}
                  <ChevronDown className="size-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
                  Switch View
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {views.map((view) => (
                  <DropdownMenuItem key={view.path} asChild>
                    <Link
                      to={view.path}
                      className="flex items-start gap-3 py-2.5 cursor-pointer"
                    >
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${view.path === currentView.path ? "bg-emerald-100" : "bg-slate-100"}`}
                      >
                        <view.icon
                          className={`size-4 ${view.path === currentView.path ? "text-emerald-600" : "text-slate-500"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${view.path === currentView.path ? "text-emerald-700" : "text-slate-700"}`}
                        >
                          {view.label}
                        </p>
                        <p className="text-xs text-slate-400">{view.desc}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-slate-200 text-sm font-medium gap-2"
                    >
                      <User className="size-3.5 text-emerald-600" />
                      {user?.name ? user.name.split(" ")[0] : "Account"}
                      <ChevronDown className="size-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
                      {user?.email || "Signed in"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 h-9 text-sm"
                  onClick={handleStartCampaign}
                >
                  Start Campaign
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 border-slate-200 text-sm font-medium"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 h-9 text-sm"
                  onClick={handleStartCampaign}
                >
                  Start Campaign
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="size-5 text-slate-600" />
            ) : (
              <Menu className="size-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 h-dvh z-40 bg-white pt-20 px-4 pb-6 overflow-y-auto flex flex-col md:hidden"
          >
            <div className="flex flex-col space-y-8 mt-2">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                  Navigation
                </p>
                <div className="flex flex-col space-y-1">
                  <Link
                    to="/"
                    className="text-xl font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/campaigns"
                    className="text-xl font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Campaigns
                  </Link>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                  Switch View
                </p>
                <div className="flex flex-col space-y-2">
                  {views.map((view) => (
                    <Link
                      key={view.path}
                      to={view.path}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                        view.path === currentView.path
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${view.path === currentView.path ? "bg-emerald-100/50" : "bg-slate-100"}`}
                      >
                        <view.icon
                          className={`size-5 ${view.path === currentView.path ? "text-emerald-600" : "text-slate-500"}`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-base font-semibold ${view.path === currentView.path ? "text-emerald-700" : "text-slate-700"}`}
                        >
                          {view.label}
                        </p>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {view.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-auto space-y-3">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg font-medium shadow-sm"
                  onClick={handleStartCampaign}
                >
                  Start Campaign
                </Button>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-6 text-lg font-medium text-red-600 border-red-100 hover:bg-red-50 gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-6 text-lg font-medium"
                    onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

