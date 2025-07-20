// src/pages/CatalogPage.jsx
import { services } from "../data/catalogData";

const CatalogPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ffe3ec] via-[#d2f2ff] to-[#f5e0ff] dark:bg-gray-900 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-pink-700 dark:text-pink-400 mb-12">
          Our Services
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-5 space-y-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {service.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {service.description}
                </p>
                <p className="text-pink-700 dark:text-pink-300 font-semibold">
                  {service.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
