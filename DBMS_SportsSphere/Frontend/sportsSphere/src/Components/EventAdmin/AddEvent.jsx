import React, { useState } from "react";
import axios from "axios";
import { getUserFromToken } from "../../Utils/Auth";
import Footer from "../Footer";
import Navbar from "../Navbar";

const AddEvent = () => {
  const user = getUserFromToken();
  const adminId = user?.id;
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sportType: "",
    date: "",
    time: "",
    venue: "",
    registrationLink: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!adminId) {
    alert("Admin ID missing in token!");
    return;
  }

  try {
    setLoading(true); // 🔄 START LOADING

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `http://localhost:8080/api/events/create/${adminId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Event created successfully!");
    console.log("Created Event:", response.data);

    setFormData({
      title: "",
      description: "",
      sportType: "",
      date: "",
      time: "",
      venue: "",
      registrationLink: "",
    });
  } catch (err) {
    console.error("Failed:", err);
    alert("Failed to create event.");
  } finally {
    setLoading(false); // ✅ STOP LOADING
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">

     <Navbar/>

      {/* ⭐ FORM SECTION */}
      <div className="flex-grow flex justify-center items-center py-10">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
            Create New Event
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <textarea
              name="description"
              placeholder="Event Description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <input
              type="text"
              name="sportType"
              placeholder="Sport Type"
              value={formData.sportType}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            <input
              type="text"
              name="venue"
              placeholder="Venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <input
              type="text"
              name="registrationLink"
              placeholder="Registration Link"
              value={formData.registrationLink}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>

          </form>

        </div>
      </div>
     <Footer/>
      
    </div>
  );
};

export default AddEvent;
