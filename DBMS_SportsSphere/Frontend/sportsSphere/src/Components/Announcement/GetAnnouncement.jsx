import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';

const API_BASE_URL = 'http://localhost:8080/api';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const GetAnnouncement = () => {
    const { sportId } = useParams();
    const navigate = useNavigate();
    
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sportName, setSportName] = useState("");

    // --- Fetch Sport Details (to get the Name) ---
    const fetchSportDetails = async (id) => {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        try {
            const response = await axios.get(`${API_BASE_URL}/sports/get/${id}`, config);
            setSportName(response.data.name);
        } catch (err) {
            console.error("Could not fetch sport details:", err);
            setSportName("Unknown Sport");
        }
    };

    useEffect(() => {
        if (!sportId) {
            setError('Missing Sport ID in URL.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            try {
                setIsLoading(true);
                // Fetch Sport Name and Announcements concurrently
                await Promise.all([
                    fetchSportDetails(sportId),
                    axios.get(`${API_BASE_URL}/announcements/sport/${sportId}`, config).then(res => {
                        setAnnouncements(res.data);
                    })
                ]);
                setError(null);
            } catch (err) {
                console.error('Error fetching announcements:', err.response || err);
                if (err.response?.status === 404) {
                    setError('Sport not found or announcements endpoint is unavailable.');
                } else if (err.response?.status === 401 || err.response?.status === 403) {
                    setError('Authentication failed. Please login again.');
                } else {
                    setError('An unexpected error occurred while connecting to the server.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sportId]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium italic">Loading announcements...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center mt-6">
                    <span className="text-2xl block mb-2">⚠️</span>
                    <p className="font-bold">{error}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-sm underline font-semibold">Go Back</button>
                </div>
            );
        }

        if (announcements.length === 0) {
            return (
                <div className="p-12 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-center mt-6 shadow-sm">
                    <div className="text-5xl mb-4 text-gray-300">✉️</div>
                    <h3 className="text-xl font-bold text-gray-700">No Announcements Yet</h3>
                    <p className="text-gray-400 mt-2">There are currently no updates for the {sportName} team.</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {announcements.map((announcement) => (
                    <div 
                        key={announcement.id} 
                        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {announcement.title}
                            </h2>
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                Update
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                {announcement.sender?.name?.charAt(0) || "C"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">
                                    {announcement.sender?.name || 'Team Coordinator'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatTimestamp(announcement.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100 italic">
                           "{announcement.message}"
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-32 max-w-3xl">
                <div className="mb-10 text-center">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-indigo-600 text-sm font-bold hover:gap-2 transition-all flex items-center justify-center mx-auto mb-4"
                    >
                        ← Back to Team
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        📢 {sportName} Team Updates
                    </h1>
                    <p className="text-gray-500 mt-2">Stay updated with the latest team news and schedule changes.</p>
                </div>
                
                {renderContent()}
            </div>
            <Footer />
        </div>
    );
};

export default GetAnnouncement;