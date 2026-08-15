import { Shirt, Zap, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import laundryImg from "../../assets/laundry-hero.svg";

export const HeroSection = ({ userName }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 shadow-xl dark:bg-gray-900 dark:bg-opacity-60 dark:border-gray-800 dark:border-opacity-60 p-8 md:p-12">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 bg-opacity-30 rounded-full blur-3xl dark:bg-opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-300 bg-opacity-30 rounded-full blur-3xl dark:bg-opacity-20" />
      </div>

      <div className="relative flex flex-col-reverse items-center gap-8 md:flex-row md:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-6 animate-fade-in">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Welcome back
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
              Hey {userName}!
            </h1>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            Schedule a pickup and enjoy fresh, expertly cleaned laundry delivered to your door.
          </p>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Same-day delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Schedule anytime</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/place-order")}
            className="mt-4 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg transition duration-200 hover:shadow-xl hover:-translate-y-px group"
          >
            <Shirt className="w-5 h-5" />
            <span>New Order</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center animate-slide-up">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 bg-indigo-300 bg-opacity-30 rounded-3xl blur-xl dark:bg-opacity-20" />
            <img
              src={laundryImg}
              alt="Laundry Illustration"
              className="relative w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
