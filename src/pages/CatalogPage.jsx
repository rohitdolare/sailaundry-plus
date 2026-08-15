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
    <div className="px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Services" />

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300 mt-10">Loading services...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {catalog.map((category) => (
              <div
                key={category.id}
                className="rounded-3xl border border-white border-opacity-60 bg-white bg-opacity-60 shadow-lg backdrop-blur-xl backdrop-filter dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60"
              >
                <div className="p-5 space-y-4">
                  <h2 className="font-heading text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {category.name}
                  </h2>

                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-60 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-2"
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
