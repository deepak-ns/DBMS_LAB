import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getUserFromToken } from '../../Utils/Auth';
import Footer from '../Footer';
import Navbar from '../Navbar';

const SlotsBooked = () => {
  const { facilityId } = useParams();
  const user = getUserFromToken();
  const token = localStorage.getItem('token');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        `http://localhost:8080/api/bookings/facility/${facilityId}/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookings(res.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [facilityId]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setMessage('');
      await axios.put(
        `http://localhost:8080/api/bookings/cancel/${bookingId}/user/${user.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Booking cancelled successfully. Amount refunded to wallet.');
      // Refresh bookings after cancellation
      fetchBookings();
    } catch (err) {
      setMessage('Failed to cancel booking.');
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
    <Navbar/>
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Booked Slots</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {bookings.length === 0 ? (
        <p>No active paid bookings found for this facility.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="border p-4 mb-3 rounded shadow flex justify-between items-center"
            >
              <div>
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Amount:</strong> ₹{booking.amount}</p>
                <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
                <p><strong>Booking Status:</strong> {booking.bookingStatus}</p>
              </div>
              <button
                onClick={() => handleCancelBooking(booking.id)}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel Booking
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    
    </div>
    <Footer/>
    </>
  );
};

export default SlotsBooked;
