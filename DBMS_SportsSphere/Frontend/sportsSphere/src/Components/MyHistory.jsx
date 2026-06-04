import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";

const API_BASE = "http://localhost:8080/api";

const MyHistory = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [errorBookings, setErrorBookings] = useState("");
  const [errorRentals, setErrorRentals] = useState("");

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        setErrorBookings("");
        const res = await axios.get(`${API_BASE}/bookings/user/${user.id}`, { headers });
        const data = res.data;
        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          setBookings(sorted);
        } else {
          setBookings([]);
          if (typeof data === "string") setErrorBookings(data);
        }
      } catch (err) {
        setErrorBookings(err.response?.data || "Failed to load bookings.");
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    const fetchRentals = async () => {
      try {
        setLoadingRentals(true);
        setErrorRentals("");
        const res = await axios.get(`${API_BASE}/equipment/user/${user.id}/rentals`, { headers });
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.rentedAt || 0) - new Date(a.rentedAt || 0)
        );
        setRentals(sorted);
      } catch (err) {
        setErrorRentals(err.response?.data || "Failed to load equipment rentals.");
        setRentals([]);
      } finally {
        setLoadingRentals(false);
      }
    };

    fetchBookings();
    fetchRentals();
  }, [user?.id, navigate]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
  const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");
  const formatTime = (t) => (t ? String(t) : "—");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My History</h1>
          <p className="text-gray-600 mb-8">
            View your past slot bookings and equipment rentals.
          </p>

          {/* Slot / Event Bookings */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">
              Slot & Event Bookings
            </h2>
            {loadingBookings ? (
              <p className="text-gray-500">Loading bookings...</p>
            ) : errorBookings ? (
              <p className="text-red-600">{errorBookings}</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500">No bookings yet.</p>
            ) : (
              <ul className="space-y-4">
                {bookings.map((b) => (
                  <li
                    key={b.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {b.facilityName || "Facility"}
                        </p>
                        {b.slot && (
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(b.slot.date)} · {formatTime(b.slot.startTime)}
                            {b.slot.endTime ? ` – ${formatTime(b.slot.endTime)}` : ""}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Booked on {formatDateTime(b.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-700">₹{b.amount ?? "—"}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                            b.bookingStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : b.bookingStatus === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {b.bookingStatus ?? "—"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{b.paymentStatus ?? "—"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Equipment Rentals */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-emerald-600 pb-2 mb-4">
              Equipment Rentals
            </h2>
            {loadingRentals ? (
              <p className="text-gray-500">Loading rentals...</p>
            ) : errorRentals ? (
              <p className="text-red-600">{errorRentals}</p>
            ) : rentals.length === 0 ? (
              <p className="text-gray-500">No equipment rentals yet.</p>
            ) : (
              <ul className="space-y-4">
                {rentals.map((r) => (
                  <li
                    key={r.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.equipmentName || "Equipment"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {r.quantity} · Rented on {formatDateTime(r.rentedAt)}
                        </p>
                        {r.returnedAt && (
                          <p className="text-sm text-gray-500">
                            Returned on {formatDateTime(r.returnedAt)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-700">₹{r.rentAmount ?? "—"}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                            r.rentalStatus === "returned"
                              ? "bg-gray-100 text-gray-800"
                              : r.rentalStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.rentalStatus === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {r.rentalStatus ?? "—"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{r.paymentStatus ?? "—"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyHistory;
