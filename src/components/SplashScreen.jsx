import { useEffect } from "react";

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <h1 className="text-3xl font-bold">Pocket Planner</h1>
    </div>
  );
};

export default SplashScreen;