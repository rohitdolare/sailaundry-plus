const testimonials = [
  {
    name: "Riya Sharma",
    quote:
      "SaiLaundry+ made my life so much easier! Pickup and delivery were smooth, and my clothes came back like new.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Amit Verma",
    quote:
      "I love how simple and fast the app is. Scheduling pickups is a breeze, and the service is top-notch.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Neha Kapoor",
    quote:
      "Great UI, smooth experience, and my laundry was handled with care. Highly recommend!",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

export const Testimonials = () => {
  return (
    <div className="mt-12">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        What Our Customers Say
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-gray-200 bg-white/60 p-6 shadow-md backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/60"
          >
            <div className="mb-4 flex items-center gap-4">
              <img
                src={t.image}
                alt={t.name}
                className="h-12 w-12 rounded-full border-2 border-indigo-400 object-cover"
              />
              <h4 className="font-semibold text-gray-800 dark:text-white">
                {t.name}
              </h4>
            </div>
            <p className="italic text-gray-700 dark:text-gray-300">
              “{t.quote}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

