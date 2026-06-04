import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUserFromToken();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/events/${userId}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;

        // ⭐ Sort notifications → latest first
        const sorted = data;

        setNotifications(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch notifications");
        setLoading(false);
      });
  }, [userId]);

  return (
    <>
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />

      {/* ⭐ Fix navbar overlapping */}
      <div className="pt-24 max-w-3xl mx-auto bg-gray-100 p-6 mt-4 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Your Notifications
        </h2>

        {loading && <p className="text-center text-gray-600">Loading...</p>}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && notifications.length === 0 && (
          <p className="text-center text-gray-500">
            No notifications available.
          </p>
        )}

        <ul className="space-y-4">
          {notifications.map((note, index) => (
            <li
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
            >
              <p className="text-gray-700">{note}</p>
            </li>
          ))}
        </ul>
      </div>
      </div>

      <Footer />
    </>
  );
};

export default Notifications;
