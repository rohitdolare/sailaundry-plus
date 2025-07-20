import { Edit3, MapPin, Trash2 } from "lucide-react";

const LocationCard = ({ loc, index, onDelete }) => (
  <div className="relative rounded-xl bg-white/80 dark:bg-gray-800/70 p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition hover:shadow-md">
    <MapPin className="text-sky-500 dark:text-sky-400 mb-2" />
    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{loc.label}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-300">{loc.address}</p>

    <div className="absolute top-2 right-2 flex gap-2">
      <button className="text-blue-500 hover:text-blue-600">
        <Edit3 size={16} />
      </button>
      <button onClick={() => onDelete(index)} className="text-red-500 hover:text-red-600">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default LocationCard;
