// components/profile/AddLocationModal.jsx
import { useEffect } from "react";
import { MapPin, Home, X } from "lucide-react";

const AddLocationModal = ({ isOpen, onClose, onSave, label, setLabel, address, setAddress }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!label.trim() || !address.trim()) return;
    onSave({ label: label.trim(), address: address.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5" /> Add New Location
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <Home className="w-4 h-4" /> Label
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Home, Office"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <MapPin className="w-4 h-4" /> Full Address
            </label>
            <textarea
              rows="3"
              className="w-full border p-2 rounded mt-1 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="123 Main St, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
