import { Sparkles, Heart, Shield } from "lucide-react";

export const HighlightNote = () => (
  <div className="mt-16 space-y-6">
    {/* Main highlight card */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800/60 dark:via-slate-800/50 dark:to-slate-900/60 p-8 border border-white/50 dark:border-slate-700/60 backdrop-blur-sm shadow-lg dark:shadow-lg dark:shadow-purple-500/10">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-indigo-200 dark:from-indigo-500/10 to-purple-200 dark:to-purple-500/10 rounded-full opacity-20" />
      <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr from-pink-200 dark:from-pink-500/10 to-purple-200 dark:to-purple-500/10 rounded-full opacity-20" />

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 text-center">
        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 hidden md:block" />
        <div className="space-y-2">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            We care for your clothes like they're our own.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            100% satisfaction guarantee • Premium quality • Expert handling
          </p>
        </div>
        <Sparkles className="w-8 h-8 text-pink-600 dark:text-pink-400 flex-shrink-0 hidden md:block" />
      </div>
    </div>

    {/* Trust badges */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/60 backdrop-blur-sm">
        <Heart className="w-6 h-6 text-red-500 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-white">1000+</span> Happy Customers
        </p>
      </div>
      <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/60 backdrop-blur-sm">
        <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-white">100%</span> Secure & Safe
        </p>
      </div>
    </div>
  </div>
);

