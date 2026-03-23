import {
  ShieldCheck,
  Heart,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const links = {
  Platform: [
    { label: "How It Works", href: "#" },
    { label: "Browse Campaigns", href: "/campaigns" },
    { label: "Start a Campaign", href: "/create", requiresAuth: true },
    {
      label: "Request Hospital Verification",
      href: "/request-hospital-verification",
    },
    { label: "Pricing", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Report Fraud", href: "#" },
    { label: "Partner With Us", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Refund Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleAuthLink = (item) => {
    if (item.requiresAuth) {
      navigate(isAuthenticated ? item.href : "/login");
    } else if (item.href.startsWith("#")) {
      // Anchor link, do nothing
    } else {
      navigate(item.href);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">TrustBridge</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The most transparent medical crowdfunding platform in Africa.
              Every donation is escrowed and verified.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.requiresAuth ? (
                      <button
                        onClick={() => handleAuthLink(item)}
                        className="text-sm text-slate-400 hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    ) : item.href.startsWith("#") ? (
                      <a
                        href={item.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} TrustBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">
              Secured by Interswitch
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

