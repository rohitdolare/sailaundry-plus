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

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: "", mobile: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
   
           console.log("use",user);

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

  if (!profile) return <p className="p-4">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <PageHeader
        title="Your Profile"
        subtitle="Manage personal information and saved locations."
      />

      {/* 🔹 Profile Card */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            👤 Personal Info
          </h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="rounded bg-blue-100 px-3 py-1 text-sm hover:bg-blue-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label>Name</label>
            {editMode ? (
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full rounded border bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-800 dark:text-white">{profile.name}</p>
            )}
          </div>
          <div>
            <label>Mobile</label>
            {editMode ? (
              <input
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="mt-1 w-full rounded border bg-white p-2 text-gray-900 dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="text-gray-800 dark:text-white">{profile.mobile}</p>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setEditMode(false)}>Cancel</button>
            <button
              onClick={handleSave}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* 🔹 Locations */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
          📍 Your Locations
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(profile.locations || []).map((loc, i) => (
            <LocationCard key={i} loc={loc} index={i} onDelete={handleDelete} />
          ))}
          <AddLocationButton onSave={handleAddLocation} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
