// src/pages/PlaceOrderPage.jsx
import { useState } from "react";
import { Calendar, Clock, MapPin, Shirt, StickyNote } from "lucide-react";
import PageHeader from "../components/PageHeader";

const PlaceOrderPage = () => {
  const [formData, setFormData] = useState({
    name: "Rohit", // TODO: prefill from context
    phone: "",
    address: "",
    pickupDate: "",
    pickupTime: "",
    laundryType: "Regular",
    instructions: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Placing order:", formData);
    // TODO: send data to backend
  };

  return (
    <div className="p-4">
      <PageHeader title="Place a New Order" />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mt-6 space-y-6 bg-white shadow-md rounded-xl p-6"
      >
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
            <MapPin size={16} /> Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter your pickup address"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
              <Calendar size={16} /> Pickup Date
            </label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
              <Clock size={16} /> Pickup Time
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Laundry Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
            <Shirt size={16} /> Laundry Type
          </label>
          <select
            name="laundryType"
            value={formData.laundryType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Regular">Regular</option>
            <option value="Dry Clean">Dry Clean</option>
            <option value="Iron Only">Iron Only</option>
          </select>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
            <StickyNote size={16} /> Special Instructions (optional)
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="2"
            placeholder="Any notes for the delivery person?"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition"
          >
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderPage;
