import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Shirt, StickyNote } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import AddLocationModal from "../components/profile/AddLocationModal";
import { getUserProfile, addOrder, addLocation } from "../services/firestore";

const PlaceOrderPage = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: "",
    pickupTime: "",
    laundryType: "Regular",
    instructions: "",
  });

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

    fetchLocations();
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locations.length) {
      toast.error("Please add a pickup location before placing an order.");
      return;
    }

    const selectedLocation = locations[selectedLocationIndex];

    const orderData = {
      userId: user.uid,
      userName: user.name,
      userMobile: user.mobile,
      pickupLocation: selectedLocation,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      laundryType: formData.laundryType,
      instructions: formData.instructions,
      status: "Pending",
      createdAt: new Date(),
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
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order.");
    }
  };

  return (
    // ...other imports remain unchanged

    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen p-4 transition-colors duration-300">
      <PageHeader title="Place a New Order" />

      <form
        onSubmit={handleSubmit}
        className="dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 mx-auto mt-6 max-w-2xl space-y-6 rounded-2xl border bg-white p-6 shadow-xl transition-all duration-300"
      >
        {/* Location Selector */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-zinc-800 dark:text-zinc-100 mb-1 block flex items-center gap-1 font-medium dark:text-black">
              <MapPin size={16} /> Select Pickup Location
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => setShowAddLocationModal(true)}
            >
              + Add Location
            </button>
          </div>
          {locations.length > 0 ? (
            <select
              value={selectedLocationIndex}
              onChange={(e) =>
                setSelectedLocationIndex(parseInt(e.target.value))
              }
              className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 mt-1 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-black"
            >
              {locations.map((loc, index) => (
                <option
                  key={index}
                  value={index}
                  className="dark:bg-zinc-900 dark:text-black"
                >
                  {loc.label} - {loc.address}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
              No saved locations.
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-zinc-800 mb-1 block flex items-center gap-1 font-medium dark:text-black">
              <Calendar size={16} /> Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
              className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-black"
            />
          </div>
          <div>
            <label className="text-zinc-800 mb-1 block flex items-center gap-1 font-medium dark:text-black">
              <Clock size={16} /> Pickup Time
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:outline-none w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-black"
            />
          </div>
        </div>

        {/* Laundry Type */}
        <div>
          <label className="text-zinc-800 mb-1 block flex items-center gap-1 font-medium dark:text-black">
            <Shirt size={16} /> Laundry Type
          </label>
          <select
            name="laundryType"
            value={formData.laundryType}
            onChange={handleChange}
            className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:outline-none w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-black"
          >
            <option
              value="Regular"
              className="dark:bg-zinc-900 dark:text-black"
            >
              Regular
            </option>
            <option
              value="Dry Clean"
              className="dark:bg-zinc-900 dark:text-black"
            >
              Dry Clean
            </option>
            <option
              value="Iron Only"
              className="dark:bg-zinc-900 dark:text-black"
            >
              Iron Only
            </option>
          </select>
        </div>

        {/* Instructions */}
        <div>
          <label className="text-zinc-800 mb-1 block flex items-center gap-1 font-medium dark:text-black">
            <StickyNote size={16} /> Special Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            placeholder="e.g. Please handle delicate clothes with care."
            className="bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:text-black"
          />
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
