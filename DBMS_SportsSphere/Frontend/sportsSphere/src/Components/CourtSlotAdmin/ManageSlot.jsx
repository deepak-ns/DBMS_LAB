import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useAuth } from "../../AuthContext";

const ManageSlot = () => {
  console.log("🎯 ManageSlot component loaded.");

  const { facilityId } = useParams();
  const token = localStorage.getItem("token");

  console.log("➡️ facilityId from params:", facilityId);
  console.log("➡️ token from context:", token);

  const [slots, setSlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editData, setEditData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    amount: "",
    status: "",
  });

  // Fetch slots
  useEffect(() => {
    console.log("📡 useEffect triggered. Fetching slots…");

    if (!facilityId) {
      console.error("❌ facilityId is undefined in useEffect!");
      return;
    }

    axios
      .get(`http://localhost:8080/api/courtslots/facility/${facilityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ Slots fetched successfully:", res.data);
        setSlots(res.data);
      })
      .catch((err) => {
        console.error("❌ Error fetching slots:", err);
        if (err.response) {
          console.error("Server Response:", err.response.data);
        }
      });
  }, [facilityId, token]);

  // Delete Slot
  const handleDelete = async (slotId) => {
    console.log("🗑️ Deleting slot:", slotId);

    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/courtslots/delete/${slotId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✔️ Slot deleted:", slotId);

      setSlots(slots.filter((slot) => slot.id !== slotId));
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // Start Editing
  const startEdit = (slot) => {
    console.log("✏️ Editing slot:", slot);

    setEditingSlotId(slot.id);
    setEditData({
      date: slot.date?.slice(0, 10),
      startTime: slot.startTime,
      endTime: slot.endTime,
      amount: slot.amount,
      status: slot.status,
    });
  };

  // Update Slot
  const handleUpdate = async (slotId) => {
    console.log("🔄 Updating slot:", slotId, editData);

    try {
      const res = await axios.put(
        `http://localhost:8080/api/courtslots/update/${slotId}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✔️ Update response:", res.data);

      setSlots(slots.map((slot) => (slot.id === slotId ? res.data : slot)));
      setEditingSlotId(null);
    } catch (err) {
      console.error("❌ Update failed:", err);
      if (err.response) console.error("Server Error:", err.response.data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">

      {console.log("🎨 Rendering ManageSlot UI…")}

      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Manage Court Slots
        </h1>

        {console.log("📦 Slots to display:", slots)}
        {slots.length === 0 && (
  <p className="text-center text-gray-600">No slots available.</p>
)}


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white p-6 shadow-lg rounded-2xl border border-gray-200"
            >
              {editingSlotId !== slot.id ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Slot #{slot.id}
                  </h2>

                  <p className="text-gray-600 mt-2">
                    <b>Date:</b> {slot.date?.slice(0, 10)}
                  </p>
                  <p className="text-gray-600">
                    <b>Time:</b> {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="text-gray-600">
                    <b>Amount:</b> ₹{slot.amount}
                  </p>
                  <p className="text-gray-600">
                    <b>Status:</b> {slot.status}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => startEdit(slot)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Edit Slot #{slot.id}
                  </h2>

                  <div className="space-y-3">
                    <input
                      type="date"
                      value={editData.date}
                      onChange={(e) =>
                        setEditData({ ...editData, date: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />

                    <input
                      type="time"
                      value={editData.startTime}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />

                    <input
                      type="time"
                      value={editData.endTime}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />

                    <input
                      type="number"
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          amount: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Amount"
                    />

                    <select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          status: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                    </select>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => handleUpdate(slot.id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingSlotId(null)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ManageSlot;
