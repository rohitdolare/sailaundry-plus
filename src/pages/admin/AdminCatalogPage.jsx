import { useEffect, useState } from "react";
import {
  getCatalog,
  updateCatalogSection,
  addCatalogSection,
  deleteCatalogSection,
} from "../../services/firestore";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Save, Tags } from "lucide-react";
import { getSectionIcon } from "../../utils/sectionIcon";

const AdminCatalogPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await getCatalog();
      const normalized = Array.isArray(data)
        ? data.map((s) => ({ ...s, id: s.id || s.name }))
        : [];
      setCatalog(normalized);
      setSelectedId((prev) =>
        prev && normalized.some((s) => s.id === prev) ? prev : normalized[0]?.id ?? null
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load catalog.");
      setCatalog([]);
      setSelectedId(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

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
      const id = await addCatalogSection(name);
      toast.success("Section added.");
      setNewSectionName("");
      await loadCatalog();
      setSelectedId(id);
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
      setCatalog((prev) => {
        const next = prev.filter((s) => s.id !== section.id);
        setSelectedId((curr) => (curr === section.id ? next[0]?.id ?? null : curr));
        return next;
      });
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
    updateItem(sectionId, itemIndex, () => ({ [field]: value }));
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
  const selectedSection = catalog.find((s) => s.id === selectedId) || null;
  const DetailIcon = selectedSection ? getSectionIcon(selectedSection.name) : null;

  return (
    <div className="w-full transition-colors duration-300">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col gap-4">
        {/* Header */}
        <header className="shrink-0 flex items-center gap-2">
          <Tags size={22} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <h1 className="font-heading text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Services &amp; pricing
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {catalog.length} section{catalog.length !== 1 ? "s" : ""} · {totalItems} item
              {totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </header>

        {/* Editor */}
        {catalog.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 p-12 text-center">
            <Tags className="mx-auto mb-3 text-gray-400 dark:text-gray-500" size={40} />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No sections yet. Sections group your services, like Men, Women, or Household.
            </p>
            <form onSubmit={handleAddSection} className="flex items-center justify-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Section name (e.g. Men)"
                className="flex-1 min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={addingSection}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0 shadow-lg transition"
              >
                <Plus size={16} /> Add
              </button>
            </form>
          </div>
        ) : (
          <section className="rounded-3xl bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
            {/* Section rail */}
            <aside className="flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 dark:border-opacity-80 lg:self-start">
              <div className="max-h-52 lg:max-h-[26rem] overflow-y-auto py-1.5">
                {catalog.map((section) => {
                  const isSelected = section.id === selectedId;
                  const count = (section.items || []).length;
                  const SectionIcon = getSectionIcon(section.name);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSelectedId(section.id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 text-indigo-700 dark:text-indigo-300"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                            isSelected
                              ? "bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-60 text-indigo-600 dark:text-indigo-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          <SectionIcon size={14} />
                        </span>
                        <span className="truncate">{section.name || "Untitled"}</span>
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              <form
                onSubmit={handleAddSection}
                className="shrink-0 flex items-center gap-1.5 p-2.5 border-t border-gray-100 dark:border-gray-800 dark:border-opacity-80"
              >
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="New section"
                  className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  disabled={addingSection}
                  aria-label="Add section"
                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 shrink-0 transition"
                >
                  <Plus size={16} />
                </button>
              </form>
            </aside>

            {/* Section detail */}
            <div className="min-w-0 flex flex-col">
              {!selectedSection ? (
                <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a section to edit its items and pricing.
                </p>
              ) : (
                <>
                  <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 dark:border-opacity-80 bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-30">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-40 text-indigo-600 dark:text-indigo-400">
                        <DetailIcon size={16} />
                      </span>
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={selectedSection.name || ""}
                          onChange={(e) =>
                            updateSection(selectedSection.id, () => ({ name: e.target.value }))
                          }
                          placeholder="Section name"
                          className="w-full min-w-0 bg-transparent font-heading text-lg font-bold text-gray-900 dark:text-gray-100 border-none px-0 py-0.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {(selectedSection.items || []).length} item
                          {(selectedSection.items || []).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveSection(selectedSection)}
                        disabled={savingId === selectedSection.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-md transition min-h-[2.25rem]"
                      >
                        <Save size={14} /> {savingId === selectedSection.id ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(selectedSection)}
                        title="Delete section"
                        aria-label="Delete section"
                        className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800 dark:divide-opacity-60">
                    {(selectedSection.items || []).length === 0 ? (
                      <p className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No items in this section yet.
                      </p>
                    ) : (
                      (selectedSection.items || []).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="px-4 sm:px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-30 transition"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item.name || ""}
                              onChange={(e) =>
                                setItemField(selectedSection.id, itemIndex, "name", e.target.value)
                              }
                              className="flex-1 min-w-0 bg-transparent rounded-lg border border-transparent px-1.5 py-1 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 focus:bg-white dark:focus:bg-gray-800 transition"
                              placeholder="Item name"
                            />
                            <button
                              type="button"
                              onClick={() => removeItem(selectedSection.id, itemIndex)}
                              title="Remove item"
                              aria-label="Remove item"
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950 transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="mt-1.5 space-y-1 pl-1.5">
                            {(item.services || []).map((svc, svcIndex) => (
                              <div key={svcIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={svc.type || ""}
                                  onChange={(e) =>
                                    setServiceField(
                                      selectedSection.id,
                                      itemIndex,
                                      svcIndex,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                  placeholder="Service (e.g. Wash & Fold)"
                                />
                                <div className="relative shrink-0">
                                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    value={svc.price ?? ""}
                                    onChange={(e) =>
                                      setServiceField(
                                        selectedSection.id,
                                        itemIndex,
                                        svcIndex,
                                        "price",
                                        parseInt(e.target.value, 10) || 0
                                      )
                                    }
                                    className="w-20 sm:w-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-6 pr-2 py-1.5 text-sm tabular-nums text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeService(selectedSection.id, itemIndex, svcIndex)}
                                  title="Remove service"
                                  aria-label="Remove service"
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950 transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addService(selectedSection.id, itemIndex)}
                              className="inline-flex items-center gap-1 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition focus:outline-none focus-visible:underline"
                            >
                              <Plus size={12} /> Add service
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="px-4 sm:px-5 py-2.5">
                      <button
                        type="button"
                        onClick={() => addItem(selectedSection.id)}
                        className="w-full py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-400 dark:border-opacity-50 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Add item
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminCatalogPage;
