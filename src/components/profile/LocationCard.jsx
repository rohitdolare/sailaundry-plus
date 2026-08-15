import { Edit3, MapPin, Trash2 } from "lucide-react";

const LocationCard = ({ loc, index, onDelete }) => (
  <div className="relative rounded-2xl bg-white bg-opacity-60 backdrop-blur-xl backdrop-filter border border-white border-opacity-60 shadow-md dark:bg-gray-900 dark:bg-opacity-60 dark:border-gray-800 dark:border-opacity-60 p-4 transition hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500">
    <MapPin className="text-indigo-600 dark:text-indigo-400 mb-2" />
    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{loc.label}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-300">{loc.address}</p>

    <div className="absolute top-2 right-2 flex gap-1">
      <button
        aria-label={`Edit ${loc.label || "location"}`}
        className="flex h-9 w-9 items-center justify-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        <Edit3 size={16} />
      </button>
      <button
        onClick={() => onDelete(index)}
        aria-label={`Delete ${loc.label || "location"}`}
        className="flex h-9 w-9 items-center justify-center text-red-500 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default LocationCard;
