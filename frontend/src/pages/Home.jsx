import HeroSection from "../components/trustbridge/HeroSection"
import StatsBanner from "../components/trustbridge/StatsBanner"
import HowItWorks from "../components/trustbridge/HowItWorks"
import FeaturedCampaigns from "../components/trustbridge/FeaturedCampaigns"
import FAQSection from "../components/trustbridge/FAQSection"
import { getCampaigns } from "@/lib/api";
import { useEffect, useState } from "react";
const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getCampaigns()
      .then(setCampaigns)
      .catch((err) => console.error("Failed to load campaigns:", err))
      .finally(() => setIsLoading(false));
  }, []);
  return (
    // <main className="h-[50dvh]">
    <main className="min-h-screen bg-white">
      <HeroSection />
      <StatsBanner />
      <HowItWorks />
      <FeaturedCampaigns campaigns={campaigns} isLoading={isLoading} />
      <FAQSection />

    </main>
  );
};

export default Home;

