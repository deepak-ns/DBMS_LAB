import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getUserFromToken } from "../../Utils/Auth";

const Book = () => {
  const { facilityId } = useParams();
  const user = getUserFromToken(); // should provide { id, email, role }

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    
    if (!facilityId || !user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
         

        // Fetch all court slots for the facility
        const slotsRes = await axios.get(
          `http://localhost:8080/api/courtslots/active/facility/${facilityId}`,
          config
        );
      
        setSlots(slotsRes.data);

      } catch (error) {
        console.error("Error fetching slots or bookings", error);
        setMessage("Failed to load slots or bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facilityId, user]);


  // Handle booking a slot
  const handleBookSlot = async (slotId) => {
    const confirmBooking = window.confirm(
      "Are you sure you want to book this slot?"
    );
    if (!confirmBooking) return;

    try {
      setMessage("");
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
        console.log(`Booking slot ${slotId} for user ${user.id} at facility ${facilityId}`);

      // Call your bookCourtSlot API with path variables
      const res = await axios.post(
        `http://localhost:8080/api/bookings/book/${user.id}/${facilityId}/${slotId}`,null,
        config
      );

      setMessage("Slot booked successfully!");

    } catch (error) {
      console.error("Booking failed", error);
      // Show backend error message if available
      const errorMsg =
        error.response?.data || "Booking failed. Please try again.";
      setMessage(errorMsg);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  if (!user)
    return (
      <>
        <Navbar />
        <div className="p-10 text-center text-xl text-red-600">
          Please log in to book slots.
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="pt-28 px-8 min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-6 text-center">Book Court Slots</h1>

        {message && (
          <div className="mb-4 p-3 text-center text-white bg-green-600 rounded">
            {message}
          </div>
        )}

        {slots.length === 0 ? (
          <p className="text-center text-gray-600">No slots available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(slot.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {slot.startTime} - {slot.endTime}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{slot.amount}
                </p>
                <p>
                  <strong>Status:</strong> {slot.status}
                </p>

                {slot.status.toLowerCase()==="booked" ? (
                  <button
                    disabled
                    className="mt-4 w-full bg-gray-500 text-white py-2 rounded cursor-not-allowed"
                  >
                    Already Booked
                  </button>
                ) : slot.status.toLowerCase() === "available" ? (
                  <button
                    onClick={() => handleBookSlot(slot.id)}
                    className="mt-4 w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Book Slot
                  </button>
                ) : (
                  <button
                    disabled
                    className="mt-4 w-full bg-red-500 text-white py-2 rounded cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Book;
