import { X, PackageCheck, LoaderCircle, Clock } from "lucide-react";

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
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center md:p-4">
      {/* Backdrop click layer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-br from-blue-50 via-white to-purple-100 rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md p-6 max-h-screen overflow-y-auto
        animate-slide-up md:animate-fade-in
        md:mt-0 mt-auto"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-indigo-700">Order #{order.id}</h2>
          <p className="text-sm text-gray-600">Placed on {order.date}</p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700">Status:</span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            {getStatusIcon(order.status)} {order.status}
          </span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-gray-700">Total:</span>
          <span className="text-lg font-bold text-emerald-600">₹{order.total}</span>
        </div>

        {/* Items */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
