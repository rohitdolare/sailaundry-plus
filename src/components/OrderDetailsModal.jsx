import { useEffect } from "react";
import { Link } from "react-router-dom";
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
  Pencil,
  Trash2,
} from "lucide-react";

const OrderDetailsModal = ({ order, onClose, onEdit, onDelete }) => {
  // Lock body scroll when modal is open so background doesn't scroll
  useEffect(() => {
    if (!order) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [order]);

  if (!order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <PackageCheck className="text-green-500" size={20} />;
      case "In Progress":
        return <LoaderCircle className="text-indigo-600 dark:text-indigo-400 animate-spin-slow" size={20} />;
      case "Pending Pickup":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const createdAt = order.createdAt?.toDate?.() || new Date(order.createdAt);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white bg-opacity-80 backdrop-blur-xl backdrop-filter dark:bg-gray-900 dark:bg-opacity-80
          rounded-t-3xl md:rounded-3xl border border-white border-opacity-60 dark:border-gray-800 dark:border-opacity-60 shadow-xl w-full md:max-w-lg p-6 max-h-screen overflow-y-auto overscroll-contain
          animate-slide-up md:animate-fade-in mt-auto md:mt-0"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close order details"
          className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold text-indigo-600 dark:text-indigo-400">Order #{order.orderNumber ?? order.id}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <CalendarDays size={16} /> Placed on {createdAt.toLocaleDateString()}
          </p>
        </div>

        {/* Status and Total */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
            {getStatusIcon(order.status)}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{order.status}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
            <IndianRupee size={18} /> {order.totalAmount}
          </div>
        </div>

        {/* Pickup Info */}
        <div className="mb-4 space-y-1">
          <h4 className="font-semibold text-gray-800 dark:text-white">Pickup</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <CalendarDays size={16} /> {order.pickupDate}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Clock size={16} /> {order.pickupTime}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <MapPin size={16} /> {order.pickupLocation?.label} – {order.pickupLocation?.address}
          </p>
        </div>

        {/* User Info */}
        <div className="mb-4 space-y-1">
          <h4 className="font-semibold text-gray-800 dark:text-white">Customer</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <User size={16} /> {order.userName}
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1 min-w-0">
              <Phone size={16} className="shrink-0" />
              <span className="truncate">{order.userMobile || "—"}</span>
            </p>
            {order.userMobile && (
              <a
                href={`tel:${String(order.userMobile).replace(/\D/g, "")}`}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
                aria-label={`Call ${order.userName || "customer"}`}
              >
                <Phone size={14} /> Call
              </a>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Items</h4>
          <ul className="space-y-2">
            {order.items?.map((item, idx) => (
              <li
                key={idx}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white bg-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 text-sm"
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
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Instructions</h4>
            <p className="italic text-sm text-gray-600 dark:text-gray-400">“{order.instructions}”</p>
          </div>
        )}

        {/* Edit / Delete (admin only) */}
        {onEdit && order.id && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            <Link
              to={`/admin/create-order/${order.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
            >
              <Pencil size={18} /> Edit Order
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(order)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 bg-white text-red-600 font-semibold transition hover:bg-red-600 hover:text-white hover:border-red-600 dark:border-red-900 dark:bg-transparent"
              >
                <Trash2 size={18} /> Delete Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
