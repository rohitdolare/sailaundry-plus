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
      toast.error("Enter section name.");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="text-gray-600 dark:text-gray-400">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 min-w-0">
        <div className="flex items-center gap-2 mb-6">
          <Tags size={24} className="text-indigo-500" />
          <h1 className="text-xl font-bold">Edit Catalog</h1>
        </div>

        {/* Add section */}
        <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="New section name (e.g. Men, Women)"
            className="flex-1 min-w-0 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={addingSection}
            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shrink-0"
          >
            <Plus size={16} /> Add section
          </button>
        </form>

        {/* Sections */}
        <div className="space-y-3">
          {catalog.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No sections. Add one above.</p>
          ) : (
            catalog.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center p-3 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(section.id)}
                      className="p-0.5 shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label={expanded[section.id] ? "Collapse" : "Expand"}
                    >
                      {expanded[section.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                    <input
                      type="text"
                      value={section.name || ""}
                      onChange={(e) => updateSection(section.id, () => ({ name: e.target.value }))}
                      className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-900 dark:text-white border-none focus:ring-0 px-1"
                      placeholder="Section name"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveSection(section)}
                      disabled={savingId === section.id}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 min-h-[2.5rem]"
                    >
                      <Save size={14} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[2.5rem] min-w-[2.5rem]"
                      title="Delete section"
                      aria-label="Delete section"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {expanded[section.id] !== false && (
                  <div className="p-3 pt-0 space-y-4">
                    {(section.items || []).map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Package size={14} className="text-indigo-500 shrink-0" />
                          <input
                            type="text"
                            value={item.name || ""}
                            onChange={(e) =>
                              setItemField(section.id, itemIndex, "name", e.target.value)
                            }
                            className="flex-1 min-w-0 rounded border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                            placeholder="Item name"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(section.id, itemIndex)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 min-h-[2.25rem]"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="pl-4 space-y-2">
                          {(item.services || []).map((svc, svcIndex) => (
                            <div
                              key={svcIndex}
                              className="flex flex-wrap items-center gap-2 text-sm"
                            >
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
                                className="min-w-0 flex-1 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-gray-900 dark:text-white sm:max-w-[8rem]"
                                placeholder="Service"
                              />
                              <span className="text-gray-500 dark:text-gray-400 shrink-0">₹</span>
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
                                className="w-20 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1.5 text-gray-900 dark:text-white shrink-0"
                              />
                              <button
                                type="button"
                                onClick={() => removeService(section.id, itemIndex, svcIndex)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 min-h-[2rem]"
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
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Plus size={12} /> Add service
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(section.id)}
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                    >
                      <Plus size={16} /> Add item
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCatalogPage;
