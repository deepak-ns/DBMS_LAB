import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getUserFromToken } from "../../Utils/Auth";

const ManageRent = () => {
  const { equipmentId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user=getUserFromToken();

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch equipment details
  const fetchEquipment = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/equipment/get/${equipmentId}`,
        axiosConfig
      );
      setEquipment(res.data);
    } catch (err) {
      console.error("Error fetching equipment:", err);
    }
  };

  // Fetch all rentals for this equipment
  const fetchRentals = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/equipment/user/${user.id}/equipment/${equipmentId}`,
        axiosConfig
      );
      setRentals(res.data);
    } catch (err) {
      console.error("Error fetching rentals:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEquipment();
    fetchRentals();
  }, [equipmentId]);

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Rentals</h1>

        {/* Equipment Info */}
        {equipment && (
          <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold">{equipment.name}</h2>
            <p className="text-gray-600">{equipment.sportsType}</p>
            <p className="text-gray-700 mt-1">
              Available:{" "}
              <span className="font-semibold">
                {equipment.quantityAvailable}/{equipment.quantityTotal}
              </span>
            </p>
          </div>
        )}

        {/* Rentals */}
        {loading ? (
          <p>Loading rentals...</p>
        ) : rentals.length === 0 ? (
          <p className="text-gray-600">No rentals for this equipment.</p>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  Rent ID : {rental.id}
                </h3>

                <p className="text-gray-600">
                  Quantity: <span className="font-semibold">{rental.quantity}</span>
                </p>

                <p className="text-gray-600">
                  Status:{" "}
                  <span className="font-semibold text-blue-600">
                    {rental.rentalStatus}
                  </span>
                </p>

                <p className="text-gray-600">
                  Rented At:{" "}
                  <span className="font-semibold">
                    {new Date(rental.rentedAt).toLocaleString()}
                  </span>
                </p>

                
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      </div>
    </>
  );
};

export default ManageRent;
