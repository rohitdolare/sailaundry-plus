import {
  X,
  PackageCheck,
  LoaderCircle,
  Clock,
  MapPin,
  CalendarDays,
  IndianRupee,
  User,
  Phone,
  Shirt,
} from "lucide-react";

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <PackageCheck className="text-green-500" size={20} />;
      case "In Progress":
        return <LoaderCircle className="text-blue-500 animate-spin-slow" size={20} />;
      case "Pending Pickup":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const createdAt = order.createdAt?.toDate?.() || new Date(order.createdAt);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-br from-white via-blue-50 to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800
          rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-lg p-6 max-h-screen overflow-y-auto
          animate-slide-up md:animate-fade-in mt-auto md:mt-0"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-indigo-700">Order #{order.id}</h2>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <CalendarDays size={16} /> Placed on {createdAt.toLocaleDateString()}
          </p>
        </div>

        {/* Status and Total */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Status:</span>
            {getStatusIcon(order.status)}
            <span className="text-sm font-semibold text-gray-700">{order.status}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
            <IndianRupee size={18} /> {order.totalAmount}
          </div>
        </div>

        {/* Pickup Info */}
        <div className="mb-4 space-y-1">
          <h4 className="font-semibold text-gray-800 dark:text-white">Pickup Details:</h4>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <CalendarDays size={16} /> {order.pickupDate}
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <Clock size={16} /> {order.pickupTime}
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <MapPin size={16} /> {order.pickupLocation?.label} – {order.pickupLocation?.address}
          </p>
        </div>

        {/* User Info */}
        <div className="mb-4 space-y-1">
          <h4 className="font-semibold text-gray-800 dark:text-white">Customer Info:</h4>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <User size={16} /> {order.userName}
          </p>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <Phone size={16} /> {order.userMobile}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Items:</h4>
          <ul className="space-y-2">
            {order.items?.map((item, idx) => (
              <li
                key={idx}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm text-sm"
              >
                <div className="flex justify-between font-medium">
                  <span className="flex items-center gap-1">
                    <Shirt size={14} /> {item.item} ({item.section})
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    x{item.quantity}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Service: {item.service} • Price: ₹{item.price}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        {order.instructions && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Instructions:</h4>
            <p className="italic text-sm text-gray-600 dark:text-gray-400">“{order.instructions}”</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
