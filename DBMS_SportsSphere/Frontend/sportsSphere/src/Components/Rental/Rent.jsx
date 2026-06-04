import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useAuth } from "../../AuthContext"; // Assuming AuthContext provides user context
import { getUserFromToken } from "../../Utils/Auth"; // Assuming Auth utility exists

const Rent = () => {
    const { equipmentId } = useParams(); // Get equipmentId from the URL path: /rent-equipment/:equipmentId
    const navigate = useNavigate();

    const { isLoggedIn } = useAuth();
    const user = getUserFromToken(); // Get the currently logged-in user details

    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        quantity: 1,
        hours: 1
    });
    const [totalCost, setTotalCost] = useState(0);

    // --- Token and Config Helper ---
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    // --- Fetch Equipment Details ---
    useEffect(() => {
        if (!isLoggedIn || !user) {
            setError("Please log in to rent equipment.");
            setLoading(false);
            return;
        }
        
       const fetchEquipmentDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = getAuthHeaders();
            const response = await axios.get(
                // Ensure this URL is correct based on your final Java mapping
                `http://localhost:8080/api/equipment/get/${equipmentId}`, 
                config
            );
            setEquipment(response.data);
        } catch (err) {
            console.error("Error fetching equipment details:", err);
            // Handle 404 specifically
            if (err.response && err.response.status === 404) {
                 setError(`Equipment with ID ${equipmentId} was not found.`);
            } else {
                 setError("Failed to load equipment details. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

        if (equipmentId) {
            fetchEquipmentDetails();
        }
    }, [equipmentId, isLoggedIn, user.id]);

    // --- Calculate Total Cost Effect ---
    useEffect(() => {
        if (equipment) {
            const cost = equipment.rentPerHour * formData.quantity * formData.hours;
            setTotalCost(cost);
        }
    }, [formData, equipment]);

    // --- Handle Form Changes ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Ensure values are numbers and handle minimums
        const numValue = Math.max(1, Number(value)); 

        setFormData(prev => ({
            ...prev,
            [name]: numValue
        }));
    };

    // --- Handle Rent Submission ---
    const handleRentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Client-side validation
        if (formData.quantity > equipment.quantityAvailable) {
            setError(`Cannot rent ${formData.quantity}. Only ${equipment.quantityAvailable} available.`);
            setLoading(false);
            return;
        }

        try {
            const config = getAuthHeaders();
            const rentPayload = {
                quantity: formData.quantity,
                hours: formData.hours
            };
            console.log("Equipment id:", equipmentId);
            console.log("User id:", user.id);

            await axios.post(
                `http://localhost:8080/api/equipment/rent/${equipmentId}/user/${user.id}`, // Use the correct rent endpoint
                rentPayload,
                config
            );

            alert("Equipment rented successfully!");
            navigate('/equipments'); // Redirect to equipment list or user rentals page

        } catch (err) {
            console.error("Rental error:", err);
            // Display specific error message from the backend if available
            const message = err.response?.data?.message || err.response?.data || "Failed to complete rental. Please check your balance and availability.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <div className="flex-grow container mx-auto px-4 py-8 pt-24 text-center">
                    <p className="text-xl text-blue-600">Loading equipment and user details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !equipment) {
         return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <div className="flex-grow container mx-auto px-4 py-8 pt-24 text-center">
                    <div className="p-12 bg-red-50 rounded-xl shadow-lg border border-red-200">
                         <p className="text-xl font-semibold text-red-600 mb-4">Error</p>
                         <p className="text-gray-700">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
    
    if (!equipment) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Navbar />
                <div className="flex-grow container mx-auto px-4 py-8 pt-24 text-center">
                     <p className="text-xl text-gray-700">Equipment not found.</p>
                </div>
                <Footer />
            </div>
        );
    }


    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-8 pt-24 max-w-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Rent {equipment.name}
                </h1>
                
                <div className="bg-white p-6 shadow-xl rounded-xl border border-blue-100">
                    <h2 className="text-2xl font-semibold text-blue-700 mb-4">{equipment.name}</h2>
                    <div className="space-y-2 text-md text-gray-700 mb-6 border-b pb-4">
                        <p><span className="font-semibold">Type:</span> {equipment.sportsType}</p>
                        <p><span className="font-semibold">Rent Per Hour:</span> <span className="text-green-600">₹{equipment.rentPerHour ? equipment.rentPerHour.toFixed(2) : 'N/A'}</span></p>
                        <p><span className="font-semibold">Available Stock:</span> {equipment.quantityAvailable}</p>
                        </div>

                    <form onSubmit={handleRentSubmit} className="space-y-6">
                        {/* Quantity Input */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity to Rent
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                                max={equipment.quantityAvailable}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                                disabled={loading || equipment.quantityAvailable === 0}
                            />
                            {formData.quantity > equipment.quantityAvailable && (
                                <p className="text-sm text-red-500 mt-1">Maximum available is {equipment.quantityAvailable}.</p>
                            )}
                        </div>

                        {/* Hours Input */}
                        <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                                Rental Duration (Hours)
                            </label>
                            <input
                                type="number"
                                id="hours"
                                name="hours"
                                value={formData.hours}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                                disabled={loading}
                            />
                        </div>

                        {/* Total Cost Display */}
                        <div className="text-center p-3 border-t border-b border-gray-200 bg-blue-50 rounded-lg">
                            <p className="text-xl font-bold text-blue-700">
                                Total Cost: ₹{totalCost.toFixed(2)}
                            </p>
                            {user && user.walletBalance < totalCost && (
                                <p className="text-sm text-red-500 mt-1 font-semibold">
                                    Insufficient wallet balance for this transaction.
                                </p>
                            )}
                        </div>
                        
                        {error && (
                            <div className="p-3 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition shadow-lg ${
                                loading || equipment.quantityAvailable === 0 || user.walletBalance < totalCost 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                            disabled={loading || equipment.quantityAvailable === 0 || user.walletBalance < totalCost}
                        >
                            {loading ? "Processing..." : equipment.quantityAvailable === 0 ? "Out of Stock" : "Confirm Rent"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Rent;