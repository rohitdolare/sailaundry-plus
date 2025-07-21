// src/pages/PlaceOrderPage.jsx
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Shirt, StickyNote } from "lucide-react";
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
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen p-4 transition-colors duration-300">
      <PageHeader title="Place a New Order" />

      <form
        onSubmit={handleSubmit}
        className="dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 mx-auto mt-6 max-w-3xl space-y-6 rounded-2xl border bg-white p-6 shadow-xl transition-all duration-300"
      >
        {/* Location */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-zinc-800 mb-1 block font-medium dark:text-black">
              <MapPin size={16} /> Pickup Location
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => setShowAddLocationModal(true)}
            >
              + Add Location
            </button>
          </div>
          <select
            value={selectedLocationIndex}
            onChange={(e) => setSelectedLocationIndex(parseInt(e.target.value))}
            className="mt-1 w-full rounded-xl border bg-zinc-100 px-4 py-2 dark:bg-zinc-800 dark:text-black"
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
          <div>
            <label className="block font-medium text-zinc-800 dark:text-black mb-1">
              <Calendar size={16} /> Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              className="w-full rounded-xl border bg-zinc-100 px-4 py-2 dark:bg-zinc-800 dark:text-black"
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-800 dark:text-black mb-1">
              <Clock size={16} /> Pickup Time
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border bg-zinc-100 px-4 py-2 dark:bg-zinc-800 dark:text-black"
            />
          </div>
        </div>

       

        {/* Items Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-black">
            Order Items
          </h3>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-center"
            >
              <select
                value={item.section}
                onChange={(e) => handleItemChange(index, "section", e.target.value)}
                className="rounded-xl border bg-zinc-100 px-3 py-2 dark:bg-zinc-800 dark:text-black"
              >
                <option value="">Section</option>
                {catalog.map((section) => (
                  <option key={section.name} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>

              <select
                value={item.item}
                onChange={(e) => handleItemChange(index, "item", e.target.value)}
                className="rounded-xl border bg-zinc-100 px-3 py-2 dark:bg-zinc-800 dark:text-black"
              >
                <option value="">Item</option>
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
                className="rounded-xl border bg-zinc-100 px-3 py-2 dark:bg-zinc-800 dark:text-black"
              >
                <option value="">Service</option>
                {catalog
                  .find((sec) => sec.name === item.section)
                  ?.items?.find((it) => it.name === item.item)
                  ?.services?.map((srv) => (
                    <option key={srv.type} value={srv.type}>
                      {srv.type} ({srv.price} ₹)
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                className="rounded-xl border bg-zinc-100 px-3 py-2 dark:bg-zinc-800 dark:text-black"
              />

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add Item
          </button>
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-medium text-zinc-800 dark:text-black mb-1">
            <StickyNote size={16} /> Special Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-xl border bg-zinc-100 px-4 py-2 dark:bg-zinc-800 dark:text-black"
            placeholder="e.g. Please handle delicate clothes with care."
          />
        </div>

        {/* Total Amount */}
        <div className="text-right text-lg font-semibold text-zinc-800 dark:text-black">
          Total: ₹
          {items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white shadow-md transition duration-300 hover:from-blue-700 hover:to-indigo-700"
          >
            Place Order
          </button>
        </div>
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
  );
};

export default PlaceOrderPage;
