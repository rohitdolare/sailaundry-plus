import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { getCatalog } from "../services/firestore";

const CatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCatalog();
        setCatalog(data);
      } catch (error) {
        console.error("Failed to load catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ffe3ec] via-[#d2f2ff] to-[#f5e0ff] dark:bg-gray-900 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Our Services" />

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300 mt-10">Loading catalog...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {catalog.map((category) => (
              <div
                key={category.id}
                className="bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-xl shadow-xl"
              >
                <div className="p-5 space-y-4">
                  <h2 className="text-2xl font-bold text-pink-700 dark:text-pink-300 border-b border-pink-200 pb-2">
                    {category.name}
                  </h2>

                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md space-y-2"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {item.name}
                      </h3>
                      <div className="space-y-1">
                        {item.services.map((service, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                            <span>{service.type}</span>
                            <span className="font-medium">₹{service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
