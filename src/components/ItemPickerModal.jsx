import { useEffect, useState } from "react";
import { Search, X, Plus, Minus } from "lucide-react";

/** Bottom-sheet (mobile) / centered dialog (desktop) for browsing the catalog and adding items to an order. */
const ItemPickerModal = ({ catalog, items, onQuickAdd, onQuickRemove, onClose }) => {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("All");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const q = search.trim().toLowerCase();
  const filteredCatalog = catalog
    .filter((section) => activeSection === "All" || section.name === activeSection)
    .map((section) => ({
      ...section,
      items: section.items?.filter((it) => !q || it.name.toLowerCase().includes(q)) || [],
    }))
    .filter((section) => section.items.length > 0);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-xl max-h-[85vh] md:max-h-[80vh] flex flex-col animate-slide-up md:animate-fade-in overflow-hidden">
        <div className="md:hidden pt-2 pb-1 flex justify-center shrink-0">
          <span className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-gray-100">Add items</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2 space-y-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items to add..."
              className="w-full rounded-xl border border-transparent bg-gray-50 dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 border-t border-gray-100 dark:border-gray-800">
          {filteredCatalog.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              {catalog.length === 0 ? "Loading catalog..." : "No items match your search"}
            </p>
          ) : (
            filteredCatalog.map((section) => (
              <div key={section.name} className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {section.name}
                </h4>
                <div className="flex flex-col gap-2">
                  {section.items.map((it) =>
                    it.services?.map((srv) => {
                      const existing = items.find(
                        (i) => i.section === section.name && i.item === it.name && i.service === srv.type
                      );
                      return (
                        <div
                          key={`${it.name}-${srv.type}`}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2 min-h-[52px] transition ${
                            existing
                              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900 dark:bg-opacity-30"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                              {it.name} · {srv.type}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">₹{srv.price}</p>
                          </div>
                          {existing ? (
                            <div className="flex items-center gap-0.5 rounded-lg bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 overflow-hidden shrink-0">
                              <button
                                type="button"
                                onClick={() => onQuickRemove(section.name, it.name, srv.type)}
                                aria-label={`Remove one ${it.name} · ${srv.type}`}
                                className="p-2.5 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-40 active:scale-[0.98] transition"
                              >
                                <Minus size={15} />
                              </button>
                              <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {existing.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onQuickAdd(section.name, it.name, srv)}
                                aria-label={`Add one more ${it.name} · ${srv.type}`}
                                className="p-2.5 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-40 active:scale-[0.98] transition"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onQuickAdd(section.name, it.name, srv)}
                              className="shrink-0 flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-semibold px-3 py-2.5 min-h-[44px] hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-30 active:scale-[0.98] transition"
                            >
                              <Plus size={15} /> Add
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            Done{itemCount > 0 ? ` · ${itemCount} item${itemCount !== 1 ? "s" : ""} · ₹${total}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemPickerModal;
