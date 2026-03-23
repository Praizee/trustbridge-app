import Footer from "@/components/trustbridge/Footer";
import Navbar from "@/components/trustbridge/Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}

