import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken } from "../Utils/Auth"; 
import { useAuth } from "../AuthContext"; 
import Navbar from './Navbar';
import Footer from './Footer';

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);
  const navigate = useNavigate();

  // --- Auth Check ---
  const { isLoggedIn } = useAuth(); 
  const user = getUserFromToken(); 
  const isAdmin = isLoggedIn && user?.role?.toLowerCase() === "admin";
  const isCoordinator = isLoggedIn && user?.role?.toLowerCase() === "coordinator";
  const canViewEquipmentHistory = isAdmin || isCoordinator;

  // --- Token and Config Helper ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    };
  };

  // --- Fetch Logic ---
  const fetchEquipments = async () => {
    setLoading(true);
    setError(null);
    if (!isLoggedIn) {
        setLoading(false);
        return;
    }
    
    const config = getAuthHeaders();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError("Missing authentication token. Please re-login.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/equipment/all", config); 
      setEquipments(response.data);
    } catch (err) {
      console.error("Error fetching equipments:", err);
      if (err.response && err.response.status === 401) {
          setError("Authentication failed. Please log in again.");
      } else {
          setError("Failed to fetch equipments. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalHistory = async () => {
    if (!canViewEquipmentHistory) return;
    setLoadingHistory(true);
    setErrorHistory(null);
    try {
      const res = await axios.get("http://localhost:8080/api/equipment/rentals/all", getAuthHeaders());
      const data = Array.isArray(res.data) ? res.data : [];
      const sorted = [...data].sort(
        (a, b) => new Date(b.rentedAt || 0) - new Date(a.rentedAt || 0)
      );
      setRentalHistory(sorted);
    } catch (err) {
      setErrorHistory(err.response?.data || "Failed to load equipment rental history.");
      setRentalHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [isLoggedIn]);

  useEffect(() => {
    if (canViewEquipmentHistory) fetchRentalHistory();
  }, [canViewEquipmentHistory]); 

  // --- Handlers ---
  const handleRent = (equipmentId) => {
    navigate(`/rent-equipment/${equipmentId}`);
  };

  const handleManageRentals = (equipmentId) => {
    navigate(`/manage-rentals/${equipmentId}`);
  };

  const handleMyRentals = (equipmentId) => {
    navigate(`/my-rentals/${equipmentId}`);
  };
  
  const handleAddEquipment = () => { navigate('/add-equipment'); };
  const handleLoginRedirect = () => { navigate('/login'); };

  // --- EDIT HANDLERS ---
  const handleStartUpdate = (equipment) => {
    setEditingEquipmentId(equipment.id);
    // Initialize form data with current equipment values
    setEditFormData({
        name: equipment.name,
        sportsType: equipment.sportsType,
        quantityTotal: equipment.quantityTotal,
        quantityAvailable: equipment.quantityAvailable,
        rentPerHour: equipment.rentPerHour,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
        ...prev,
        // Convert numbers fields to actual numbers
        [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSaveUpdate = async (id) => {
    setLoading(true);
    try {
      const config = getAuthHeaders();
      // Send PUT request to update the equipment
      const response = await axios.put(
        `http://localhost:8080/api/equipment/update/${id}`, 
        editFormData, 
        config
      );
      
      // Update the equipment list with the response data
      setEquipments(prev => prev.map(e => e.id === id ? response.data : e));
      setEditingEquipmentId(null); // Exit edit mode
      alert(`Equipment ${response.data.name} updated successfully!`);

    } catch (err) {
      console.error("Error updating equipment:", err);
      setError("Failed to update equipment. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelUpdate = () => {
    setEditingEquipmentId(null);
    setEditFormData({});
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      const config = getAuthHeaders();
      await axios.delete(`http://localhost:8080/api/equipment/delete/${id}`, config);
      
      // Remove the deleted item from the state
      setEquipments(prev => prev.filter(e => e.id !== id));
      alert("Equipment deleted successfully!");

    } catch (err) {
      console.error("Error deleting equipment:", err);
      setError("Failed to delete equipment. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------

  // --- Main Render ---
  const renderContent = () => {
    if (!isLoggedIn || error) {
      // Display Login/Error block
      return (
        <div className="text-center p-12 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
          <p className={`text-2xl font-semibold mb-6 ${error ? 'text-red-600' : 'text-gray-700'}`}>
            {error || "Please **login to view** and rent available equipment."}
          </p>
          <button
            onClick={handleLoginRedirect}
            className="bg-blue-800 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition shadow-xl"
          >
            Go to Login
          </button>
        </div>
      );
    }

    const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");

    // Display Equipment List
    return (
      <>
        {/* Admin Button */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleAddEquipment}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition shadow-md"
            >
              ➕ Add Equipment
            </button>
          </div>
        )}
        
        {/* Equipment List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipments.length > 0 ? (
            equipments.map((equipment) => (
              <div
                key={equipment.id}
                className={`bg-white p-6 shadow-xl rounded-xl border ${editingEquipmentId === equipment.id ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-100 hover:border-blue-200'} transition duration-300`}
              >
                {/* Conditional Rendering: Edit Form or Details */}
                {isAdmin && editingEquipmentId === equipment.id ? (
                    <EquipmentEditForm
                        equipment={equipment}
                        formData={editFormData}
                        onChange={handleEditChange}
                        onSave={() => handleSaveUpdate(equipment.id)}
                        onCancel={handleCancelUpdate}
                        disabled={loading}
                    />
                ) : (
                    <EquipmentCardDetails
                        equipment={equipment}
                        handleRent={() => handleRent(equipment.id)}
                        handleManageRentals={() => handleManageRentals(equipment.id)}
                        handleMyRentals={() => handleMyRentals(equipment.id)} // Pass equipment.id
                        isAdmin={isAdmin}
                        handleStartUpdate={() => handleStartUpdate(equipment)}
                        handleDelete={() => handleDelete(equipment.id)}
                    />
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No equipments are currently available.
            </p>
          )}
        </div>

        {/* Equipment rental history – admin & coordinator only, below cards */}
        {canViewEquipmentHistory && (
          <div className="mt-10 bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Equipment Rental History</h2>
            <p className="text-gray-600 mb-6">All equipment rentals across the portal.</p>
            {loadingHistory ? (
              <p className="text-gray-500">Loading rental history...</p>
            ) : errorHistory ? (
              <p className="text-red-600">{errorHistory}</p>
            ) : rentalHistory.length === 0 ? (
              <p className="text-gray-500">No equipment rentals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 font-semibold text-gray-800">Equipment</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Rented by</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Qty</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Amount</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Status</th>
                      <th className="py-3 px-4 font-semibold text-gray-800">Rented at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalHistory.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{r.equipmentName || "—"}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{r.rentedByName || "—"}</p>
                          {r.rentedByEmail && (
                            <p className="text-sm text-gray-500">{r.rentedByEmail}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{r.quantity ?? "—"}</td>
                        <td className="py-3 px-4 font-medium text-green-700">₹{r.rentAmount ?? "—"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
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
                        </td>
                        <td className="py-3 px-4 text-gray-700">{formatDateTime(r.rentedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <>
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar/>
      <div className="flex-grow container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Equipments
        </h1>
        {loading ? (
            <div className="text-center p-12"><p className="text-xl text-blue-600">Loading Equipments...</p></div>
        ) : (
            renderContent()
        )}
      </div>
      
    </div>
    <Footer/>
    </>
  );
};

// --- Sub Components for Cleaner Render Logic ---

const EquipmentCardDetails = ({ equipment, handleRent, handleMyRentals,handleManageRentals, isAdmin, handleStartUpdate, handleDelete }) => (
    <>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{equipment.name}</h2>
        <p className="text-sm text-blue-700 font-medium mb-4">{equipment.sportsType}</p>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
            <p><span className="font-semibold">Available:</span> <span className="text-green-600 font-bold">{equipment.quantityAvailable}</span></p>
            <p><span className="font-semibold">Rent/Hour:</span> ₹{equipment.rentPerHour ? equipment.rentPerHour.toFixed(2) : 'N/A'}</p>
        </div>
        
        <div className="mt-4 space-y-3">
            <button
                onClick={handleRent}
                className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-md"
                disabled={equipment.quantityAvailable <= 0}
            >
                {equipment.quantityAvailable > 0 ? "Rent" : "Out of Stock"}
            </button>
             <button
                onClick={handleMyRentals}
                className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-md"
            >
                My Rentals
            </button>

           
        </div>

        {isAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                    onClick={handleManageRentals}
                    className="w-full bg-blue-900 text-white text-sm py-1.5 rounded-lg font-semibold hover:bg-blue-950 transition"
                >
                    Manage Rentals
                </button>
                <button
                    onClick={handleStartUpdate}
                    className="w-full bg-blue-900 text-white text-sm py-1.5 rounded-lg font-semibold hover:bg-blue-950 transition"
                >
                    Update Equipment
                </button>
                <button
                    onClick={handleDelete}
                    className="w-full bg-red-600 text-white text-sm py-1.5 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    Delete Equipment
                </button>


            </div>
        )}
    </>
);

const EquipmentEditForm = ({ formData, onChange, onSave, onCancel, disabled }) => (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <h3 className="text-xl font-bold text-red-600">Editing Equipment</h3>

        {/* Input: Name */}
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={onChange}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Input: Quantity Available */}
        <label className="block text-sm font-medium text-gray-700">Available Qty</label>
        <input
            type="number"
            name="quantityAvailable"
            value={formData.quantityAvailable || 0}
            onChange={onChange}
            required
            min="0"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Input: Rent Per Hour */}
        <label className="block text-sm font-medium text-gray-700">Rent/Hour (₹)</label>
        <input
            type="number"
            name="rentPerHour"
            value={formData.rentPerHour || 0}
            onChange={onChange}
            required
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="pt-2 space-y-2">
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                disabled={disabled}
            >
                Save Changes
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition shadow-md"
                disabled={disabled}
            >
                Cancel
            </button>
        </div>
    </form>
);

export default Equipments;