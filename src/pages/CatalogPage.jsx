import { useEffect, useMemo, useState } from "react";
import { Search, X, Tags } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { getCatalog } from "../services/firestore";
import { getSectionIcon } from "../utils/sectionIcon";
import { sortSectionsByUsage } from "../utils/sectionOrder";

const CatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCatalog();
        setCatalog(sortSectionsByUsage(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Failed to load catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalItems = useMemo(
    () => catalog.reduce((sum, s) => sum + (s.items || []).length, 0),
    [catalog]
  );

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return catalog
      .filter((section) => activeSection === "All" || section.name === activeSection)
      .map((section) => {
        if (!query) return section;
        const items = (section.items || []).filter(
          (item) =>
            item.name?.toLowerCase().includes(query) ||
            (item.services || []).some((s) => s.type?.toLowerCase().includes(query))
        );
        return { ...section, items };
      })
      .filter((section) => (section.items || []).length > 0);
  }, [catalog, activeSection, searchQuery]);

  const filteredItemCount = useMemo(
    () => filteredCatalog.reduce((sum, s) => sum + (s.items || []).length, 0),
    [filteredCatalog]
  );

  const isFiltering = Boolean(searchQuery.trim()) || activeSection !== "All";

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Services" />

        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-300 mt-10">Loading services...</p>
        ) : catalog.length === 0 ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 p-12 text-center">
            <Tags className="mx-auto mb-3 text-gray-400 dark:text-gray-500" size={40} />
            <p className="text-gray-500 dark:text-gray-400">No services available yet. Please check back soon.</p>
          </div>
        ) : (
          <>
            {/* Search & filter */}
            <div className="sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 pt-1 pb-3 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search garment or service"
                    aria-label="Search services"
                    className="w-full h-9 pl-9 pr-8 rounded-xl border border-white border-opacity-60 dark:border-gray-700 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter text-gray-900 dark:text-gray-100 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:ml-auto">
                  {isFiltering ? `${filteredItemCount} of ${totalItems}` : totalItems} item
                  {totalItems !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {["All", ...catalog.map((s) => s.name)].map((name) => {
                  const isActive = activeSection === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActiveSection(name)}
                      className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition ${
                        isActive
                          ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "border-gray-200 bg-white bg-opacity-60 text-gray-700 backdrop-blur-md backdrop-filter hover:bg-opacity-90 dark:border-gray-700 dark:border-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 dark:text-gray-200 dark:hover:bg-opacity-80"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {filteredCatalog.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                No services match &quot;{searchQuery.trim()}&quot;.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                {filteredCatalog.map((section) => {
                  const SectionIcon = getSectionIcon(section.name);
                  return (
                  <div
                    key={section.id}
                    className="rounded-3xl border border-white border-opacity-60 bg-white bg-opacity-60 shadow-lg backdrop-blur-xl backdrop-filter dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-3 mb-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-40 text-indigo-600 dark:text-indigo-400">
                            <SectionIcon size={17} />
                          </span>
                          <h2 className="font-heading text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            {section.name}
                          </h2>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums">
                          {section.items.length} item{section.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800 dark:divide-opacity-60">
                        {section.items.map((item, idx) => (
                          <div key={idx} className="py-3">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                              {item.name}
                            </h3>
                            <div className="mt-1.5 space-y-1">
                              {item.services.map((service, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400"
                                >
                                  <span className="truncate">{service.type}</span>
                                  <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                                    ₹{service.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
