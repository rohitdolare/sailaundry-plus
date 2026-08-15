import { useState, useEffect } from "react";

const AddLocationModal = ({ isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  // Reset fields when modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setLabel("");
      setAddress("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!label || !address) return;

    const newLocation = { label, address };
    onSave(newLocation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-80 backdrop-blur-xl backdrop-filter dark:bg-gray-900 dark:bg-opacity-80 p-6 rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-xl w-full max-w-md">
        <h2 className="font-heading text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Location</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Home, Office"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Enter full address"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
