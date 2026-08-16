import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Shirt, StickyNote, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import AddLocationModal from "../components/profile/AddLocationModal";
import { getUserProfile, addOrder, addLocation, getCatalog } from "../services/firestore";

const PlaceOrderPage = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    instructions: "",
  });

  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState([
    {
      section: "",
      item: "",
      service: "",
      quantity: 1,
      price: 0,
    },
  ]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!user?.uid) return;

      try {
        const profile = await getUserProfile(user.uid);
        const userLocations = profile?.locations || [];

        if (userLocations.length === 0) {
          toast("No saved locations yet. Add one to continue.");
          setShowAddLocationModal(true);
        }

        setLocations(userLocations);
        setSelectedLocationIndex(0);
      } catch (err) {
        console.error("Error fetching user locations:", err);
        toast.error("Failed to fetch locations.");
      }
    };

    const fetchCatalog = async () => {
      try {
        const data = await getCatalog();
        setCatalog(data);
      } catch (err) {
        console.error("Error fetching catalog:", err);
        toast.error("Failed to load catalog.");
      }
    };

    fetchLocations();
    fetchCatalog();
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Update price if service changes
    if (field === "service" || field === "item" || field === "section") {
      const section = catalog.find((sec) => sec.name === updatedItems[index].section);
      const item = section?.items?.find((it) => it.name === updatedItems[index].item);
      const service = item?.services?.find((s) => s.type === updatedItems[index].service);

      updatedItems[index].price = service?.price || 0;
    }

    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { section: "", item: "", service: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locations.length) {
      toast.error("Please add a pickup location before placing an order.");
      return;
    }

    if (items.some((i) => !i.section || !i.item || !i.service)) {
      toast.error("Please fill out all item details.");
      return;
    }

    const selectedLocation = locations[selectedLocationIndex];

    const orderData = {
      uid: user.uid,
      userName: user.name,
      userMobile: user.mobile,
      pickupLocation: selectedLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      instructions: formData.instructions,
      status: "Pending",
      createdAt: new Date(),
      items,
      totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    };

    try {
      await addOrder(orderData);
      toast.success("Order placed successfully.");

      setFormData({
        pickupDate: "",
        pickupTime: "",
        laundryType: "Regular",
        instructions: "",
      });
      setItems([{ section: "", item: "", service: "", quantity: 1, price: 0 }]);
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order.");
    }
  };

  return (
    <div className="relative px-4 py-4 sm:py-6">
      <PageHeader title="New Order" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-6 max-w-3xl space-y-6 rounded-3xl border border-white border-opacity-60 bg-white bg-opacity-60 p-8 shadow-xl backdrop-blur-xl backdrop-filter transition-colors duration-300 dark:border-gray-800 dark:border-opacity-60 dark:bg-gray-900 dark:bg-opacity-60"
      >
        {/* Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30">
                <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Pickup Location
            </label>
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition"
              onClick={() => setShowAddLocationModal(true)}
            >
              <Plus size={16} /> Add Location
            </button>
          </div>
          <select
            value={selectedLocationIndex}
            onChange={(e) => setSelectedLocationIndex(parseInt(e.target.value))}
            className="w-full rounded-2xl border border-transparent bg-gray-100 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition"
          >
            {locations.map((loc, index) => (
              <option key={index} value={index}>
                {loc.label} - {loc.address}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30">
                <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-transparent bg-gray-100 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30">
                <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Pickup Time
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-transparent bg-gray-100 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition"
            />
          </div>
        </div>

        {/* Items Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30">
              <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
              Order Items
            </h3>
          </div>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 sm:grid-cols-5 items-end bg-white bg-opacity-40 dark:bg-gray-800 dark:bg-opacity-40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-md backdrop-filter transition"
            >
              <select
                value={item.section}
                onChange={(e) => handleItemChange(index, "section", e.target.value)}
                className="rounded-xl border border-transparent bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
              >
                <option value="">Select Section</option>
                {catalog.map((section) => (
                  <option key={section.name} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>

              <select
                value={item.item}
                onChange={(e) => handleItemChange(index, "item", e.target.value)}
                className="rounded-xl border border-transparent bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
              >
                <option value="">Select Item</option>
                {catalog
                  .find((sec) => sec.name === item.section)
                  ?.items?.map((it) => (
                    <option key={it.name} value={it.name}>
                      {it.name}
                    </option>
                  ))}
              </select>

              <select
                value={item.service}
                onChange={(e) => handleItemChange(index, "service", e.target.value)}
                className="rounded-xl border border-transparent bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
              >
                <option value="">Select Service</option>
                {catalog
                  .find((sec) => sec.name === item.section)
                  ?.items?.find((it) => it.name === item.item)
                  ?.services?.map((srv) => (
                    <option key={srv.type} value={srv.type}>
                      {srv.type} (₹{srv.price})
                    </option>
                  ))}
              </select>

              <div className="flex items-center gap-1 rounded-xl border border-transparent bg-white dark:bg-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleItemChange(index, "quantity", Math.max(1, (item.quantity || 1) - 1))}
                  disabled={(item.quantity || 1) <= 1}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:pointer-events-none transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {item.quantity || 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleItemChange(index, "quantity", (item.quantity || 1) + 1)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="rounded-xl border border-red-200 bg-white dark:bg-transparent dark:border-red-900 text-red-600 p-2 transition hover:bg-red-600 hover:text-white hover:border-red-600 flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-3 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-500 dark:border-opacity-50 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900 dark:hover:bg-opacity-20 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Another Item
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-yellow-900 dark:bg-opacity-30">
              <StickyNote size={18} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            Special Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-2xl border border-transparent bg-amber-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-amber-700 placeholder-opacity-60 dark:placeholder-gray-400 font-medium focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition resize-none"
            placeholder="e.g. Please handle delicate clothes with care"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="font-heading text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹{items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              {items.length} {items.length === 1 ? 'item' : 'items'} selected
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg transition duration-300 hover:-translate-y-px hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Shirt size={20} />
          <span>Place Order</span>
          <ArrowRight size={20} />
        </button>
      </form>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        onSave={async (newLoc) => {
          try {
            await addLocation(user.uid, newLoc);
            const updatedProfile = await getUserProfile(user.uid);
            const updatedLocations = updatedProfile?.locations || [];
            setLocations(updatedLocations);
            setSelectedLocationIndex(updatedLocations.length - 1);
            toast.success("Location added.");
            setShowAddLocationModal(false);
          } catch (error) {
            console.error("Failed to add location:", error);
            toast.error("Failed to add location.");
          }
        }}
      />
    </div>
  );
};

export default PlaceOrderPage;
