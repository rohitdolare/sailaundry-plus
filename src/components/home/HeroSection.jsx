import { Shirt, Zap, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import laundryImg from "../../assets/laundry-hero.svg";

export const HeroSection = ({ userName }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 p-8 shadow-lg md:p-12 dark:shadow-2xl dark:shadow-purple-900/20 border dark:border-slate-700">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-pink-200 to-purple-200 dark:from-pink-500/10 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative flex flex-col-reverse items-center gap-8 md:flex-row md:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-6 animate-fade-in">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              👋 Welcome back
            </p>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
              Hey {userName}!
            </h1>
          </div>
          
          <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            Ready for fresh, perfectly handled laundry? Our smart AI optimizes every wash for your clothes' longevity.
          </p>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Same-day delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Schedule anytime</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/place-order")}
            className="mt-4 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl dark:shadow-purple-500/30 transform transition duration-200 hover:scale-105 group"
          >
            <Shirt className="w-5 h-5" />
            <span>Place New Order</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center animate-slide-up">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 dark:from-indigo-500/20 to-purple-200 dark:to-purple-500/20 rounded-2xl opacity-30 blur-xl" />
            <img
              src={laundryImg}
              alt="Laundry Illustration"
              className="relative w-full h-auto drop-shadow-xl dark:drop-shadow-lg rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

