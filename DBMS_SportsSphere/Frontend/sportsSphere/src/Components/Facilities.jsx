import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../Utils/Auth";

const API_BASE_URL = "http://localhost:8080/api";

// --- Facility Card Component ---
const FacilityCard = ({ facility, isAdmin, navigate, handleDelete, handleUpdate }) => {
    const { isLoggedIn } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [sportName, setSportName] = useState("Loading...");
    
    // Use 'active' to match your console log
    const [updatedData, setUpdatedData] = useState({
        name: facility.name,
        location: facility.location || "",
        description: facility.description || "",
        active: facility.active ?? false // Use nullish coalescing for safety
    });

    // Sync state if facility prop changes from parent
    useEffect(() => {
        setUpdatedData({
            name: facility.name,
            location: facility.location || "",
            description: facility.description || "",
            active: facility.active
        });
    }, [facility]);

   useEffect(() => {
    const sportId = facility.sport?.id || facility.sportId;
    console.log("Fetching sport for facility:", facility, "with sportId:", sportId);

    const token = localStorage.getItem("token");

    if (sportId && token) {
        axios.get(
            `${API_BASE_URL}/sports/get/${sportId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then(res => setSportName(res.data.name))
        .catch(err => {
            console.error("Failed to fetch sport:", err);
            setSportName("Unknown Sport");
        });
    } else {
        setSportName("General Facility");
    }
}, [facility]);

    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUpdatedData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const onSave = () => {
        handleUpdate(facility.id, updatedData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 shadow-lg rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            {isEditing ? (
                <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Facility Name</label>
                    <input type="text" name="name" value={updatedData.name} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-500 outline-none" />
                    
                    <label className="block text-xs font-bold text-gray-400 uppercase">Location</label>
                    <input type="text" name="location" value={updatedData.location} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-500 outline-none" />
                    
                    <label className="block text-xs font-bold text-gray-400 uppercase">Description</label>
                    <textarea name="description" value={updatedData.description} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg p-2 h-24 outline-none" />

                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                        <input
                            type="checkbox"
                            name="active"
                            checked={updatedData.active}
                            onChange={handleChange}
                            id={`active-${facility.id}`}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <label htmlFor={`active-${facility.id}`} className="ml-2 text-sm text-gray-600 font-medium cursor-pointer">
                            Facility is Active
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={onSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">Save</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition">Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
                                {sportName}
                            </span>

                            {/* Status Indicator logic using facility.active */}
                            <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${facility.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className={`text-[11px] font-bold uppercase tracking-tight ${facility.active ? 'text-green-600' : 'text-red-600'}`}>
                                    {facility.active ? 'Open' : 'Not Available'}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-1">{facility.name}</h2>
                        
                        <div className="flex items-center text-gray-400 text-sm mb-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            {facility.location}
                        </div>

                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                            {facility.description}
                        </p>
                    </div>

                    <div className="space-y-2">
                        {isLoggedIn ? (
                            <button
                                onClick={() => navigate(`/facilities/${facility.id}`)}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-100"
                            >
                                View
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-gray-800 text-white py-2.5 rounded-xl font-bold hover:bg-gray-900 transition"
                            >
                                Login to View
                            </button>
                        )}
                        
                        {isAdmin && (
                            <div className="flex gap-2 border-t border-gray-50 pt-4 mt-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 text-yellow-600 text-xs font-bold border border-yellow-200 py-2 rounded-lg hover:bg-yellow-50 transition"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(facility.id, facility.name)}
                                    className="flex-1 text-red-600 text-xs font-bold border border-red-100 py-2 rounded-lg hover:bg-red-50 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main SportsList Component ---
const SportsList = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = getUserFromToken();
    const isAdmin = user?.role?.toLowerCase() === "admin";

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    const fetchFacilities = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/facilities/all`);
            setFacilities(res.data);
        } catch (err) {
            console.error("Error fetching facilities:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const handleDelete = (id, name) => {
        if (window.confirm(`Permanently delete ${name}?`)) {
            axios.delete(`${API_BASE_URL}/facilities/delete/${id}`, getAuthHeaders())
                .then(() => {
                    setFacilities(prev => prev.filter(f => f.id !== id));
                })
                .catch(err => alert("Delete failed: " + err.message));
        }
    };
    
    const handleUpdate = (id, updatedFacility) => {
        axios.put(`${API_BASE_URL}/facilities/update/${id}`, updatedFacility, getAuthHeaders())
            .then((res) => {
                // IMPORTANT: Use the data returned from the server to update local state
                setFacilities(prev => prev.map(f => (f.id === id ? { ...f, ...res.data } : f)));
            })
            .catch(err => alert("Update failed: " + err.message));
    };

    if (loading) return <div className="pt-32 text-center font-bold text-gray-500 italic">Finding the best arenas for you...</div>;

    return (
        <>
        <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Facilities</h1>
                        <p className="text-gray-500 mt-1">Discover and book our high-end sports courts.</p>
                    </div>
                    
                    {isAdmin && (
                        <button
                            onClick={() => navigate("/facilities/create")}
                            className="bg-indigo-600 text-white py-3 px-6 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200"
                        >
                            + Add New Facility
                        </button>
                    )}
                </div>

                {facilities.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {facilities.map((facility) => (
                            <FacilityCard
                                key={facility.id}
                                facility={facility}
                                isAdmin={isAdmin}
                                navigate={navigate}
                                handleDelete={handleDelete}
                                handleUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-inner">
                        <p className="text-gray-400 text-xl font-medium">No facilities found. Check back later!</p>
                    </div>
                )}
            </div>
           
        </div>
         <Footer />
         </>
    );
};

export default SportsList;