import { Sparkles, Shirt, Droplets } from "lucide-react";

const SaiLaundryLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      {/* Shirt icon - laundry */}
      <Shirt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />

      {/* Droplets icon - water/cleaning */}
      <Droplets className="w-5 h-5 text-sky-500 dark:text-sky-400" />

      {/* Sparkles icon - shine/clean clothes */}
      <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-300" />

      {/* Brand Text */}
      <span className="text-2xl font-bold text-gray-900 dark:text-indigo-600">
        SaiLaundry<span className="text-indigo-600 dark:text-indigo-400">+</span>
      </span>
    </div>
  );
};

export default SaiLaundryLogo;
