import { useEffect, useState } from "react";
import {
  getCatalog,
  updateCatalogSection,
  addCatalogSection,
  deleteCatalogSection,
} from "../../services/firestore";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Save,
  Tags,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

const AdminCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [expanded, setExpanded] = useState({});

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await getCatalog();
      setCatalog(Array.isArray(data) ? data.map((s) => ({ ...s, id: s.id || s.name })) : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load catalog.");
      setCatalog([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveSection = async (section) => {
    if (!section.id) return;
    setSavingId(section.id);
    try {
      await updateCatalogSection(section.id, {
        name: section.name || section.id,
        items: section.items || [],
      });
      toast.success("Section saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save section.");
    }
    setSavingId(null);
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    const name = newSectionName.trim();
    if (!name) {
      toast.error("Enter a section name.");
      return;
    }
    setAddingSection(true);
    try {
      await addCatalogSection(name);
      toast.success("Section added.");
      setNewSectionName("");
      await loadCatalog();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add section.");
    }
    setAddingSection(false);
  };

  const handleDeleteSection = async (section) => {
    if (!window.confirm(`Delete section "${section.name}" and all its items?`)) return;
    try {
      await deleteCatalogSection(section.id);
      toast.success("Section deleted.");
      setCatalog((prev) => prev.filter((s) => s.id !== section.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete section.");
    }
  };

  const updateSection = (sectionId, updater) => {
    setCatalog((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updater(s) } : s))
    );
  };

  const updateItem = (sectionId, itemIndex, updater) => {
    setCatalog((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...(s.items || [])];
        items[itemIndex] = { ...items[itemIndex], ...updater(items[itemIndex]) };
        return { ...s, items };
      })
    );
  };

  const addItem = (sectionId) => {
    updateSection(sectionId, (s) => ({
      items: [...(s.items || []), { name: "New item", services: [{ type: "Service", price: 0 }] }],
    }));
  };

  const removeItem = (sectionId, itemIndex) => {
    updateSection(sectionId, (s) => ({
      items: (s.items || []).filter((_, i) => i !== itemIndex),
    }));
  };

  const addService = (sectionId, itemIndex) => {
    updateItem(sectionId, itemIndex, (item) => ({
      services: [...(item.services || []), { type: "Service", price: 0 }],
    }));
  };

  const removeService = (sectionId, itemIndex, serviceIndex) => {
    updateItem(sectionId, itemIndex, (item) => ({
      services: (item.services || []).filter((_, i) => i !== serviceIndex),
    }));
  };

  const setItemField = (sectionId, itemIndex, field, value) => {
    updateItem(sectionId, itemIndex, (item) => ({ [field]: value }));
  };

  const setServiceField = (sectionId, itemIndex, serviceIndex, field, value) => {
    setCatalog((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const items = (s.items || []).map((item, i) => {
          if (i !== itemIndex) return item;
          const services = (item.services || []).map((svc, j) =>
            j === serviceIndex ? { ...svc, [field]: value } : svc
          );
          return { ...item, services };
        });
        return { ...s, items };
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading catalog...</p>
      </div>
    );
  }

  const totalItems = catalog.reduce((sum, s) => sum + (s.items || []).length, 0);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-40 text-indigo-600 dark:text-indigo-400">
            <Tags size={18} />
          </span>
          <div>
            <h1 className="font-heading text-xl font-bold leading-tight">Services &amp; pricing</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {catalog.length} section{catalog.length !== 1 ? "s" : ""} · {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Add section */}
        <form
          onSubmit={handleAddSection}
          className="flex flex-col sm:flex-row gap-2 mb-6 rounded-2xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter p-3 shadow-lg"
        >
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="New section name (e.g. Men, Women)"
            className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={addingSection}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0 shadow-lg transition"
          >
            <Plus size={16} /> Add section
          </button>
        </form>

        {/* Sections */}
        {catalog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
            <Tags size={28} className="mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No sections yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {catalog.map((section) => {
              const items = section.items || [];
              const isExpanded = expanded[section.id] !== false;
              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter shadow-lg overflow-hidden"
                >
                  {/* Section header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-gray-50 dark:bg-gray-800 dark:bg-opacity-60 p-3 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(section.id)}
                        className="p-0.5 shrink-0 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
                        aria-label={isExpanded ? "Collapse section" : "Expand section"}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <input
                        type="text"
                        value={section.name || ""}
                        onChange={(e) => updateSection(section.id, () => ({ name: e.target.value }))}
                        className="flex-1 min-w-0 bg-transparent text-base font-bold text-gray-900 dark:text-gray-100 border-none px-1.5 py-0.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition"
                        placeholder="Section name"
                      />
                      <span className="shrink-0 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveSection(section)}
                        disabled={savingId === section.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 min-h-[2.5rem]"
                      >
                        <Save size={14} /> {savingId === section.id ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section)}
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent transition duration-200 min-h-[2.5rem] min-w-[2.5rem]"
                        title="Delete section"
                        aria-label="Delete section"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-1">
                          No items in this section yet.
                        </p>
                      ) : (
                        items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 dark:border-opacity-60 bg-gray-50 dark:bg-gray-800 dark:bg-opacity-40 p-3 space-y-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) =>
                                  setItemField(section.id, itemIndex, "name", e.target.value)
                                }
                                className="flex-1 min-w-0 rounded-lg border border-transparent bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="Item name"
                              />
                              <button
                                type="button"
                                onClick={() => removeItem(section.id, itemIndex)}
                                className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent transition duration-200 shrink-0 min-h-[2.25rem]"
                                title="Remove item"
                                aria-label="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="pl-5 space-y-1.5">
                              {(item.services || []).length > 0 && (
                                <div className="hidden sm:flex items-center gap-2 px-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                  <span className="flex-1">Service</span>
                                  <span className="w-24">Price</span>
                                  <span className="w-7" />
                                </div>
                              )}
                              {(item.services || []).map((svc, svcIndex) => (
                                <div key={svcIndex} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={svc.type || ""}
                                    onChange={(e) =>
                                      setServiceField(
                                        section.id,
                                        itemIndex,
                                        svcIndex,
                                        "type",
                                        e.target.value
                                      )
                                    }
                                    className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="Service (e.g. Wash & Fold)"
                                  />
                                  <div className="relative shrink-0">
                                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={svc.price ?? ""}
                                      onChange={(e) =>
                                        setServiceField(
                                          section.id,
                                          itemIndex,
                                          svcIndex,
                                          "price",
                                          parseInt(e.target.value, 10) || 0
                                        )
                                      }
                                      className="w-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 pl-6 pr-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeService(section.id, itemIndex, svcIndex)}
                                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950 transition duration-200 shrink-0"
                                    title="Remove service"
                                    aria-label="Remove service"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addService(section.id, itemIndex)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-400 dark:border-opacity-50 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition"
                              >
                                <Plus size={12} /> Add service
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={() => addItem(section.id)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-400 dark:border-opacity-50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add item
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCatalogPage;
