import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useAuth } from "../../AuthContext";
import { getUserFromToken } from "../../Utils/Auth";
import { useState,useEffect } from "react";
import axios from "axios";
const API_BASE_URL = "http://localhost:8080/api";

const FacilityPage = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  const { isLoggedIn } = useAuth(); 

  const user = getUserFromToken();
  const fetchFacilityData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Authentication token not found.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/facilities/get/${facilityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFacility(response.data);
        } catch (err) {
            console.error("Error fetching facility data:", err);
            setError("Failed to fetch facility details. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const fetchBookingHistory = async () => {
      if (!facilityId) return;
      setLoadingHistory(true);
      setErrorHistory(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/bookings/facility/${facilityId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const dateA = a.slot?.date ? new Date(a.slot.date) : new Date(0);
            const dateB = b.slot?.date ? new Date(b.slot.date) : new Date(0);
            if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
            const timeA = (a.slot?.startTime || "").replace(":", "");
            const timeB = (b.slot?.startTime || "").replace(":", "");
            return timeB.localeCompare(timeA);
          });
          setBookingHistory(sorted);
        } else {
          setBookingHistory([]);
          if (typeof data === "string") setErrorHistory(data);
        }
      } catch (err) {
        setErrorHistory(err.response?.data || "Failed to load booking history.");
        setBookingHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    useEffect(() => {
      console.log("Fetching facility data for ID:", facilityId);
        fetchFacilityData();
    }, [facilityId]);

    useEffect(() => {
      if (!facilityId || !user) return;
      const admin = user?.role?.toLowerCase() === "admin";
      const coord = facility && user?.id === facility?.coordinator?.id;
      if (admin || coord) fetchBookingHistory();
    }, [facilityId, facility, user?.id, user?.role]);


  const isAdmin = user?.role.toLowerCase() === "admin";
  const isCoordinator = user?.id === facility?.coordinator?.id;


  return (
    <>
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Bookings & Management for {facility ? facility.name : "Facility"}
        </h1>

        {/* Two Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1 - Court Facilities */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Court Facilities
            </h2>

            <p className="text-gray-600 mb-6">
              Manage court slot bookings and cancellations
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate(`/facility/${facilityId}/book`)}
                className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Book Slots
              </button>

              <button
                onClick={() => navigate(`/facility/${facilityId}/cancel-booking`)}
                className="w-full bg-yellow-600 text-white py-2 rounded-xl font-semibold hover:bg-yellow-700 transition"
              >
                Manage Bookings
              </button>

              {/* ADMIN ONLY BUTTONS */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate(`/facility/${facilityId}/add-slot`)}
                    className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Add Court Slot
                  </button>

                  <button
                    onClick={() => navigate(`/facility/${facilityId}/manage-slots`)}
                    className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold hover:bg-purple-700 transition"
                  >
                    Manage Court Slots
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Booking History – visible only to admin or coordinator */}
        {(isAdmin || isCoordinator) && (
          <div className="mt-10 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Booking History
            </h2>
            <p className="text-gray-600 mb-6">
              Who booked and for how long at this facility.
            </p>
            {loadingHistory ? (
              <p className="text-gray-500">Loading booking history...</p>
            ) : errorHistory ? (
              <p className="text-red-600">{errorHistory}</p>
            ) : bookingHistory.length === 0 ? (
              <p className="text-gray-500">No bookings for this facility yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 font-semibold text-gray-800">Booked by</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Date</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Duration (time)</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Amount</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingHistory.map((b) => (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{b.bookedByName || "—"}</p>
                          {b.bookedByEmail && (
                            <p className="text-sm text-gray-500">{b.bookedByEmail}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {b.slot?.date ? new Date(b.slot.date).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {b.slot?.startTime && b.slot?.endTime
                            ? `${b.slot.startTime} – ${b.slot.endTime}`
                            : b.slot?.startTime
                            ? b.slot.startTime
                            : "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-green-700">
                          ₹{b.amount ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              b.bookingStatus === "approved"
                                ? "bg-green-100 text-green-800"
                                : b.bookingStatus === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {b.bookingStatus ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default FacilityPage;
