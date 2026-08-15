import { Sparkles, Heart, Shield } from "lucide-react";

export const HighlightNote = () => (
  <div className="mt-16 space-y-6">
    {/* Main highlight card */}
    <div className="relative overflow-hidden rounded-3xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 shadow-lg dark:bg-gray-900 dark:bg-opacity-60 dark:border-gray-800 dark:border-opacity-60 p-8">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-300 bg-opacity-30 rounded-full blur-2xl dark:bg-opacity-20" />
      <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-300 bg-opacity-30 rounded-full blur-2xl dark:bg-opacity-20" />

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 text-center">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 hidden md:block" />
        <div className="space-y-2">
          <p className="font-heading text-lg font-bold text-gray-900 dark:text-white">
            We treat your clothes with the same care as our own.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            100% satisfaction guarantee • Premium quality • Expert handling
          </p>
        </div>
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 hidden md:block" />
      </div>
    </div>

    {/* Trust badges */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:bg-gray-900 dark:bg-opacity-50 dark:border-gray-800 dark:border-opacity-60">
        <Heart className="w-6 h-6 text-red-500 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-white">1000+</span> Happy Customers
        </p>
      </div>
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:bg-gray-900 dark:bg-opacity-50 dark:border-gray-800 dark:border-opacity-60">
        <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-white">100%</span> Secure & Safe
        </p>
      </div>
    </div>
  </div>
);
