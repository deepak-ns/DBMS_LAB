import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const AddEquipment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sportsType: '',
    quantityTotal: 0,
    rentAmount: 0.0,
    rentPerHour: 0.0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Token and Config Helper ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Convert number inputs to numbers
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const config = getAuthHeaders();
    if (!localStorage.getItem('token')) {
        setError("Authentication token is missing. Please log in as an administrator.");
        setLoading(false);
        return;
    }
    
    // Ensure numeric values are numbers (especially for rent fields)
    const payload = {
        ...formData,
        rentAmount: parseFloat(formData.rentAmount) || 0.0,
        rentPerHour: parseFloat(formData.rentPerHour) || 0.0,
        quantityTotal: parseInt(formData.quantityTotal) || 0,
    };

    try {
        console.log("Submitting equipment with payload:", payload);
        console.log("Using config:", config);
      const response = await axios.post(
        "http://localhost:8080/api/equipment/create", 
        payload, 
        config
      );
      
      setSuccessMessage(`Equipment "${response.data.name}" added successfully! Available quantity is automatically set to ${response.data.quantityAvailable}.`);
      
      // Clear form after successful submission
      setFormData({
        name: '',
        sportsType: '',
        quantityTotal: 0,
        rentAmount: 0.0,
        rentPerHour: 0.0,
      });

    } catch (err) {
      console.error("Error creating equipment:", err.response || err);
      if (err.response && err.response.status === 403) {
        setError("Authorization failed. You must be an administrator to add equipment.");
      } else {
        setError("Failed to add equipment. Please check the input values and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8 pt-24">
        <div className="max-w-xl mx-auto bg-gray-50 p-8 shadow-2xl rounded-xl border border-gray-200">
          
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            ➕ Add New Equipment
          </h1>
          
          <hr className="mb-6 border-gray-200" />
          
          {/* Status Messages */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Equipment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-800 focus:border-blue-800 transition"
              />
            </div>

            {/* Sports Type */}
            <div>
              <label htmlFor="sportsType" className="block text-sm font-medium text-gray-700 mb-1">Sports Type / Category</label>
              <input
                type="text"
                id="sportsType"
                name="sportsType"
                value={formData.sportsType}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-800 focus:border-blue-800 transition"
              />
            </div>

            {/* Quantity Total */}
            <div>
              <label htmlFor="quantityTotal" className="block text-sm font-medium text-gray-700 mb-1">Total Quantity (Initial Stock)</label>
              <input
                type="number"
                id="quantityTotal"
                name="quantityTotal"
                value={formData.quantityTotal}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-800 focus:border-blue-800 transition"
              />
              <p className="mt-1 text-xs text-gray-500">Note: Available quantity will automatically match this value.</p>
            </div>
            
            {/* Rent Amount (Per Unit/Flat) */}
            <div>
              <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-1">Rent Amount (Flat Fee, if applicable)</label>
              <input
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-800 focus:border-blue-800 transition"
              />
            </div>

            {/* Rent Per Hour */}
            <div>
              <label htmlFor="rentPerHour" className="block text-sm font-medium text-gray-700 mb-1">Rent Per Hour</label>
              <input
                type="number"
                id="rentPerHour"
                name="rentPerHour"
                value={formData.rentPerHour}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-800 focus:border-blue-800 transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg font-bold text-lg transition shadow-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'
              }`}
            >
              {loading ? 'Adding Equipment...' : 'Create Equipment'}
            </button>
            
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(-1)} // Go back to the previous page (Equipments list)
              className="text-blue-700 hover:text-blue-900 text-sm font-semibold transition"
            >
              ← Back to Equipment List
            </button>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddEquipment;