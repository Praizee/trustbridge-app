import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const currentPath = location.pathname;

  const handleStartCampaign = () => {
    navigate(isAuthenticated ? "/create" : "/login");
  };

  let currentView = views.find((v) => v.path === currentPath);
  if (!currentView) {
    if (currentPath.startsWith("/creator") || currentPath.startsWith("/create"))
      currentView = views[1];
    else if (currentPath.startsWith("/admin")) currentView = views[2];
    else if (currentPath.startsWith("/super-admin")) currentView = views[3];
    else currentView = views[0];
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
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
                  <currentView.icon className="w-3.5 h-3.5 text-emerald-600" />
                  {currentView.label}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${view.path === currentView.path ? "bg-emerald-100" : "bg-slate-100"}`}
                      >
                        <view.icon
                          className={`w-4 h-4 ${view.path === currentView.path ? "text-emerald-600" : "text-slate-500"}`}
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

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 h-9 text-sm"
              onClick={handleStartCampaign}
            >
              Start Campaign
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white pb-4 px-4">
          <div className="space-y-1 pt-3">
            {views.map((view) => (
              <Link
                key={view.path}
                to={view.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  view.path === currentView.path
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

