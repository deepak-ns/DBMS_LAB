import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";

const API_BASE_URL = "http://localhost:8080/api";

const Sports = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  
  // State management
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Coordinator Selection State
  const [coordinators, setCoordinators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // New Sport State
  const [newSport, setNewSport] = useState({ 
    name: "", 
    description: "", 
    coordinatorId: "" 
  });

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // ✅ Helper for Headers
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  // --- 1. Fetch Sports ---
  const fetchSports = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sports/all`, getAuthHeaders());
      setSports(res.data);
    } catch (err) {
      console.error("Failed to fetch sports", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fetch Coordinators (Only if Admin) ---
  const fetchCoordinators = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/user/coordinators`, getAuthHeaders());
      setCoordinators(res.data);
    } catch (err) {
      console.error("Error fetching coordinators:", err);
    }
  };

  useEffect(() => {
    fetchSports();
    if (isAdmin) fetchCoordinators();
  }, [isAdmin]);

  // --- 3. Filtering Logic for Coordinator Search ---
  const filteredCoordinators = Array.isArray(coordinators)
    ? coordinators.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // --- 4. Handle Add Sport ---
  const handleAddSport = async (e) => {
    e.preventDefault();
    if (!newSport.coordinatorId) {
      alert("Please select a coordinator.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/sports/add`,
        { name: newSport.name, description: newSport.description },
        {
          params: { coordinatorId: newSport.coordinatorId },
          ...getAuthHeaders()
        }
      );
      setShowAddForm(false);
      setNewSport({ name: "", description: "", coordinatorId: "" });
      setSearchTerm("");
      fetchSports();
    } catch (err) {
      alert("Error adding sport. Check console for details.");
    }
  };

  // --- 5. Handle Delete Sport ---
  const handleDelete = async (sportId) => {
    if (window.confirm("Are you sure you want to delete this sport?")) {
      try {
        await axios.delete(`${API_BASE_URL}/sports/delete/${sportId}`, getAuthHeaders());
        setSports(sports.filter(s => s.id !== sportId));
      } catch (err) {
        alert("Failed to delete sport.");
      }
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading sports...</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24">
        <Navbar />

        <main className="container mx-auto p-6">
          {/* Admin Management Section */}
          {isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  {showAddForm ? "Close Form" : "+ Add New Sport"}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddSport} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Sport Name"
                      className="border p-3 rounded-lg w-full"
                      value={newSport.name}
                      onChange={(e) => setNewSport({...newSport, name: e.target.value})}
                      required
                    />
                    
                    {/* Coordinator Search & Select */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search Coordinator..."
                        className="border p-3 rounded-lg w-full bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <select
                        className="border p-3 rounded-lg w-full bg-white"
                        value={newSport.coordinatorId}
                        onChange={(e) => setNewSport({...newSport, coordinatorId: e.target.value})}
                        required
                      >
                        <option value="">-- Select Coordinator --</option>
                        {filteredCoordinators.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    placeholder="Sport Description"
                    className="border p-3 rounded-lg w-full"
                    rows="2"
                    value={newSport.description}
                    onChange={(e) => setNewSport({...newSport, description: e.target.value})}
                  />

                  <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
                    Save New Sport
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sports Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div key={sport.id} className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition flex flex-col justify-between border border-gray-100">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{sport.name}</h2>
                    {sport.isActive === false && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{sport.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/sports/${sport.id}/team`)}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded text-sm transition"
                    >
                      Team & Staff
                    </button>
                    <button
                      onClick={() => navigate(`/sports/${sport.id}/facilities`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition"
                    >
                      Facilities
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(sport.id)}
                      className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded text-sm transition font-semibold"
                    >
                      🗑 Delete Sport
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Sports;