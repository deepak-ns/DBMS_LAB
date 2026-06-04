import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useAuth } from "../../AuthContext";

const AddSlot = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    amount: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit slot to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const jwtToken = localStorage.getItem("token");

      await axios.post(
        `http://localhost:8080/api/courtslots/add/${facilityId}`,
        {
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          amount: formData.amount,
          status: "available",
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );

      setMessage("Court slot added successfully!");
      setFormData({ date: "", startTime: "", endTime: "", amount: "" });

    } catch (error) {
      console.error(error);
      setMessage("Error adding court slot.");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-10 flex-grow max-w-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Add Court Slot
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-6 space-y-6 border"
        >
          {/* Date */}
          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block font-semibold mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block font-semibold mb-1">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block font-semibold mb-1">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Adding..." : "Add Slot"}
          </button>

          {message && (
            <p className="text-center font-semibold text-green-600">
              {message}
            </p>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AddSlot;
