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

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = ["All", "Completed", "In Progress", "Pending", "Pending Pickup"];

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
        return <LoaderCircle className="text-blue-500 animate-spin-slow" size={20} />;
      case "Pending Pickup":
      case "Pending":
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <AlertTriangle className="text-red-500" size={20} />;
    }
  };

  const filteredOrders = orders
    .filter((order) => selectedStatus === "All" || order.status === selectedStatus)
    .sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

  return (
    <>
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <div className="p-4">
        <PageHeader title="Your Orders" />

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
                    ? "border-indigo-600 bg-sky-600 text-indigo-600"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
            Sort by Date
          </button>
        </div>

        {/* Orders List */}
        <div className="mt-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
              No orders found.
            </p>
          ) : (
            filteredOrders.map((order) => {
              const createdDate = order.createdAt?.toDate?.() || new Date(order.createdAt);
              const itemPreview = order.items?.[0];

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-gradient-to-br from-white via-sky-50 to-sky-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-5 shadow hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    {/* Left Side Info */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                        Order #{order.id}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <CalendarDays size={16} />
                        {createdDate.toLocaleDateString()}
                      </p>

                      <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin size={16} />
                        {order.pickupLocation?.label} – {order.pickupLocation?.address}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Shirt size={16} />
                        {order.items?.length || 0} item(s)
                        {itemPreview && typeof itemPreview === "object" && (
                          <> (e.g. {itemPreview.item} × {itemPreview.quantity})</>
                        )}
                      </p>

                      {order.instructions && (
                        <p className="text-sm italic text-gray-500 dark:text-gray-400 mt-1">
                          “{order.instructions}”
                        </p>
                      )}
                    </div>

                    {/* Right Side Info */}
                    <div className="text-right flex flex-col gap-2 items-end">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {order.status}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 font-bold text-xl text-green-600 dark:text-green-400">
                        <IndianRupee size={18} />
                        {order.totalAmount ?? "—"}
                      </span>

                      <ChevronRight className="text-sky-400" size={18} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
