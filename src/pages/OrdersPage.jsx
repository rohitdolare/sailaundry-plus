import {
  PackageCheck,
  Clock,
  LoaderCircle,
  AlertTriangle,
  Filter,
  SortAsc,
  SortDesc,
  MapPin,
  CalendarDays,
  IndianRupee,
  Shirt,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersByUserId } from "../services/firestore";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    "All",
    "Completed",
    "In Progress",
    "Pending",
    "Pending Pickup",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await getOrdersByUserId(user.uid);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <PackageCheck className="text-green-500" size={20} />;
      case "In Progress":
        return (
          <LoaderCircle className="animate-spin-slow text-indigo-600 dark:text-indigo-400" size={20} />
        );
      case "Pending Pickup":
      case "Pending":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <AlertTriangle className="text-red-500" size={20} />;
    }
  };

  const filteredOrders = orders
    .filter(
      (order) => selectedStatus === "All" || order.status === selectedStatus,
    )
    .sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

  return (
    <>
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <div className="p-4">
        <PageHeader title="Orders" />

        {/* Filter & Sort */}
        <div className="mt-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  selectedStatus === status
                    ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "border-gray-200 bg-white bg-opacity-60 text-gray-700 backdrop-blur-md backdrop-filter hover:bg-opacity-90 dark:border-gray-700 dark:border-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 dark:text-gray-200 dark:hover:bg-opacity-80"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-white bg-opacity-60 px-3 py-1 text-sm font-medium text-gray-700 backdrop-blur-md backdrop-filter hover:bg-opacity-90 dark:border-gray-700 dark:border-opacity-60 dark:bg-gray-800 dark:bg-opacity-60 dark:text-gray-200 dark:hover:bg-opacity-80"
          >
            {sortOrder === "asc" ? (
              <SortAsc size={18} />
            ) : (
              <SortDesc size={18} />
            )}
            Sort by Date
          </button>
        </div>

        {/* Orders List */}
        <div className="mt-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Loading orders...
            </p>
          ) : filteredOrders.length === 0 ? (
            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
              No orders yet.
            </p>
          ) : (
            filteredOrders.map((order) => {
              const createdDate =
                order.createdAt?.toDate?.() || new Date(order.createdAt);
              const itemPreview = order.items?.[0];

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer rounded-2xl border border-white border-opacity-60 bg-white bg-opacity-60 p-5 shadow-lg backdrop-blur-xl backdrop-filter transition duration-200 hover:bg-opacity-80 hover:shadow-xl dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 dark:hover:bg-opacity-80"
                >
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
                    {/* Left Side Info */}
                    <div className="w-full space-y-1 sm:w-auto">
                      <h3 className="font-heading text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        Order #{order.orderNumber ?? order.id}
                      </h3>

                      <p className="flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarDays size={16} />
                        {createdDate.toLocaleDateString()}
                      </p>

                      <p className="flex flex-wrap items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin size={16} />
                        {order.pickupLocation?.label} –{" "}
                        {order.pickupLocation?.address}
                      </p>

                      <p className="flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <Shirt size={16} />
                        {order.items?.length || 0} item(s)
                        {itemPreview && typeof itemPreview === "object" && (
                          <>
                            {" "}
                            (e.g. {itemPreview.item} × {itemPreview.quantity})
                          </>
                        )}
                      </p>

                      {order.instructions && (
                        <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                          “{order.instructions}”
                        </p>
                      )}
                    </div>

                    {/* Right Side Info */}
                    <div className="flex w-full flex-col items-end gap-2 text-right sm:w-auto sm:items-end sm:text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {order.status}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-xl font-bold text-green-600 dark:text-green-400">
                        <IndianRupee size={18} />
                        {order.totalAmount ?? "—"}
                      </span>

                      <ChevronRight className="text-indigo-600 dark:text-indigo-400" size={18} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Floating New Order Button */}
      <button
        onClick={() => navigate("/place-order")}
        aria-label="Create a new order"
        className="fixed bottom-20 right-6 md:bottom-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-px hover:shadow-2xl"
      >
        <Shirt size={18} className="opacity-90" />
        <span className="hidden sm:inline">New Order</span>
      </button>
    </>
  );
};

export default OrdersPage;
