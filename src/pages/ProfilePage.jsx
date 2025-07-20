import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/PageHeader";
import LocationCard from "../components/profile/LocationCard";
import {
  getUserProfile,
  updateUserProfile,
  addLocation,
  deleteLocation,
} from "../services/firestore";
import AddLocationButton from "../components/profile/AddLocationButton";
import { Pencil, Save, X } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getUserProfile(user.uid).then((data) => {
        setProfile(data);
        setFormData({ name: data?.name || "", mobile: data?.mobile || "" });
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    await updateUserProfile(user.uid, {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
    });
    setProfile((prev) => ({ ...prev, ...formData }));
    setEditMode(false);
    setLoading(false);
  };

  const handleAddLocation = async (newLocation) => {
    await addLocation(user.uid, newLocation);
    setProfile((prev) => ({
      ...prev,
      locations: [...(prev.locations || []), newLocation],
    }));
  };

  const handleDelete = async (index) => {
    await deleteLocation(user.uid, index);
    const updated = [...(profile.locations || [])];
    updated.splice(index, 1);
    setProfile((prev) => ({ ...prev, locations: updated }));
  };

  if (!profile)
    return (
      <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl p-4">
      <PageHeader
        title="👤 Your Profile"
        subtitle="View and manage your account & saved locations."
      />

      {/* 🔹 Profile Section */}
      <section className="mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-100 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Personal Info
          </h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name Field */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Full Name</label>
            {editMode ? (
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="mt-1 text-base text-gray-800 dark:text-white">{profile.name}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Mobile Number</label>
            {editMode ? (
              <input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="mt-1 text-base text-gray-800 dark:text-white">{profile.mobile}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        {editMode && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </section>

      {/* 🔹 Location Section */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          📍 Your Locations
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(profile.locations || []).map((loc, i) => (
            <LocationCard key={i} loc={loc} index={i} onDelete={handleDelete} />
          ))}
          <AddLocationButton onSave={handleAddLocation} />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
