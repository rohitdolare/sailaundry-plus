import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Riya Sharma",
    quote:
      "SaiLaundry+ made my life so much easier! Pickup and delivery were smooth, and my clothes came back like new.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
  },
  {
    name: "Amit Verma",
    quote:
      "I love how simple and fast the app is. Scheduling pickups is a breeze, and the service is top-notch.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Neha Kapoor",
    quote:
      "Great UI, smooth experience, and my laundry was handled with care. Highly recommend!",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <div className="mt-16 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          What Our Customers Say
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real experiences from 1000+ happy customers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/60 dark:to-slate-800/40 p-8 shadow-lg hover:shadow-xl dark:shadow-lg dark:hover:shadow-purple-500/10 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 transition duration-300 hover:scale-105 transform"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 dark:from-indigo-500/10 to-purple-500/5 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />

            <div className="relative space-y-4">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                "{t.quote}"
              </p>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent" />

              {/* User Info */}
              <div className="flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-12 w-12 rounded-full border-2 border-indigo-400 dark:border-indigo-500/50 object-cover shadow-md dark:shadow-lg"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {t.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Verified Customer
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
