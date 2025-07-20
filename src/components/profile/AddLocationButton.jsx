// components/profile/AddLocationButton.jsx
import { useState } from "react";
import { Plus } from "lucide-react";
import AddLocationModal from "./AddLocationModal";

const AddLocationButton = ({ onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  const handleSave = (newLocation) => {
    onSave(newLocation);
    setLabel("");
    setAddress("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full py-8 text-center flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
      >
        <Plus className="w-6 h-6 mb-1" />
        <span className="font-medium">Add Location</span>
      </button>

      <AddLocationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        label={label}
        setLabel={setLabel}
        address={address}
        setAddress={setAddress}
      />
    </>
  );
};

export default AddLocationButton;
