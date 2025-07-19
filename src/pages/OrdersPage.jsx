import {
  PackageCheck,
  Clock,
  LoaderCircle,
  AlertTriangle,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import OrderDetailsModal from "../components/OrderDetailsModal";

const OrdersPage = () => {
  const originalOrders = [
    {
      id: "ORD-001",
      date: "2025-07-19",
      status: "In Progress",
      total: 280,
      items: ["Shirt x2", "Pants x1"],
    },
    {
      id: "ORD-002",
      date: "2025-07-17",
      status: "Completed",
      total: 360,
      items: ["Saree x1", "Bedsheet x2"],
    },
    {
      id: "ORD-003",
      date: "2025-07-15",
      status: "Pending Pickup",
      total: 150,
      items: ["Towel x3"],
    },
  ];

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = ["All", "Completed", "In Progress", "Pending Pickup"];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <PackageCheck className="text-green-600" size={20} />;
      case "In Progress":
        return (
          <LoaderCircle className="animate-spin-slow text-blue-600" size={20} />
        );
      case "Pending Pickup":
        return <Clock className="text-yellow-600" size={20} />;
      default:
        return <AlertTriangle className="text-red-600" size={20} />;
    }
  };

  const filteredOrders = originalOrders
    .filter(
      (order) => selectedStatus === "All" || order.status === selectedStatus,
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date),
    );

  return (
    <>
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
      <div className="p-4">
        <PageHeader title="Your Orders" />

        {/* Filter & Sort */}
        <div className="mt-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  selectedStatus === status
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {sortOrder === "asc" ? (
              <SortAsc size={18} />
            ) : (
              <SortDesc size={18} />
            )}
            Sort by Date
          </button>
        </div>

        {/* Order List */}
        <div className="mt-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
              No orders found.
            </p>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {order.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on {order.date}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Items: {order.items.join(", ")}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-3 md:mt-0">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {order.status}
                      </span>
                    </div>
                    <span className="text-md font-medium text-gray-900 dark:text-white">
                      ₹{order.total}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
