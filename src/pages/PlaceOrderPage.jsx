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
          toast("No saved locations found. Please add one.");
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
      toast.success("Order placed successfully!");

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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 dark:from-indigo-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 dark:from-pink-500/10 to-purple-100 dark:to-purple-500/10 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative px-4 py-8">
        <PageHeader title="Place a New Order" />

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 max-w-3xl space-y-6 rounded-3xl bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/60 p-8 shadow-xl transition-all duration-300"
        >
        {/* Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
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
            className="w-full rounded-xl border-2 border-transparent bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition"
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
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              Pickup Time
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-700 px-4 py-3 text-gray-900 dark:text-white font-medium focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition"
            />
          </div>
        </div>

       

        {/* Items Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-gradient-to-r from-indigo-200 to-purple-200 dark:border-slate-700">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Order Items
            </h3>
          </div>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 sm:grid-cols-5 items-end bg-gradient-to-r from-gray-50 to-gray-50 dark:from-slate-700/50 dark:to-slate-700/30 p-4 rounded-2xl border border-gray-200 dark:border-slate-600 hover:shadow-md transition"
            >
              <select
                value={item.section}
                onChange={(e) => handleItemChange(index, "section", e.target.value)}
                className="rounded-lg border-2 border-transparent bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
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
                className="rounded-lg border-2 border-transparent bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
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
                className="rounded-lg border-2 border-transparent bg-white dark:bg-slate-600 px-3 py-2 text-gray-900 dark:text-white font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition text-sm"
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

              <div className="flex items-center gap-1 rounded-lg border-2 border-transparent bg-white dark:bg-slate-600 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleItemChange(index, "quantity", Math.max(1, (item.quantity || 1) - 1))}
                  disabled={(item.quantity || 1) <= 1}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-500 disabled:opacity-50 disabled:pointer-events-none transition"
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
                  className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-500 transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 p-2 transition flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Another Item
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <StickyNote size={18} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            Special Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border-2 border-transparent bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-900 transition resize-none"
            placeholder="e.g. Please handle delicate clothes with care..."
          />
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-2xl p-6 border border-indigo-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
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
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
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
              toast.success("Location added!");
              setShowAddLocationModal(false);
            } catch (error) {
              console.error("Failed to add location:", error);
              toast.error("Failed to add location.");
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlaceOrderPage;
