import { useState } from "react";
import SplashScreen from "../components/SplashScreen";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";

const LandingPage = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <>
          <HeroSection />
          <FeaturesSection />
        </>
      )}
    </>
  );
};

export default LandingPage;