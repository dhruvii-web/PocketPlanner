const HeroSection = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#5a1a1a] text-white">

      <div className="flex flex-col items-center mt-[10px]">

        {/* Title */}
        <h1 className="text-6xl md:text-7xl mb-4 font-serif">
          Pocket Planner
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/80 mb-8">
          Plan better. Spend smarter.
        </p>

        {/* Video */}
        <div className="w-full max-w-2xl h-56 md:h-72 bg-white/10 rounded-xl flex items-center justify-center mb-10">
          <p className="text-white/70">Intro Video Coming Soon 🎬</p>
        </div>

        {/* CTA */}
        <div className="w-full max-w-2xl">

          {/* Input */}
          <div className="flex items-center bg-[#f5efe6] rounded-full shadow-md overflow-hidden">

            <input
              type="text"
              placeholder="Enter your email or phone number"
              className="flex-1 px-6 py-4 bg-transparent outline-none text-black placeholder-gray-500"
            />

            <button className="bg-[#6b1a1a] text-white px-8 py-4 rounded-full m-1">
              Get started
            </button>

          </div>

          {/* Google */}
          <div className="mt-6 flex items-center justify-center gap-3">

            <span className="text-white/80">
              Or get started with
            </span>

            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow cursor-pointer">
              <span className="text-black font-medium">G</span>
            </div>

          </div>

          {/* ✅ Sign In (separate line) */}
          <p className="mt-4 text-white/80 text-sm text-center">
            Already have an account?
            <span className="ml-2 underline cursor-pointer hover:text-white">
              Sign In
            </span>
          </p>

        </div>

        {/* Scroll */}
        <p className="mt-8 text-sm text-white/60">
          ↓ Scroll to explore
        </p>

      </div>

    </div>
  );
};

export default HeroSection;