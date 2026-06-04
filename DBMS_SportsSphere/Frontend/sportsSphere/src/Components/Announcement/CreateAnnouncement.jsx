import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { getUserFromToken } from '../../Utils/Auth';

const API_BASE_URL = 'http://localhost:8080/api';

const CreateAnnouncement = () => {
    const { sportId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        message: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [sportName, setSportName] = useState('Loading...');
    const user=getUserFromToken();

    // --- Fetch Sport Details instead of Facility ---
    useEffect(() => {
        const fetchSportDetails = async () => {
            if (!sportId) return;

            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                // Updated endpoint to /sports/get/
                const response = await axios.get(`${API_BASE_URL}/sports/get/${sportId}`, config);
                setSportName(response.data.name || `Sport ${sportId}`);
            } catch (err) {
                console.error("Could not fetch sport details:", err);
                setSportName(`Sport ${sportId}`);
            }
        };

        fetchSportDetails();
    }, [sportId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.message.trim()) {
            setError('Title and message are required.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = {
            sportId: sportId ? Number(sportId) : null,
            senderId: user ? user.id : null,
            title: formData.title.trim(),
            message: formData.message.trim(),
        };

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const response = await axios.post(`${API_BASE_URL}/announcements/create`, payload, config);
            
            setSuccessMessage(`Success! The announcement has been posted to the ${sportName} team.`);
            setFormData({ title: '', message: '' });
            
            // Redirect back to the sports team page after success
            setTimeout(() => {
                navigate(`/sports/${sportId}/team`); 
            }, 2500);

        } catch (err) {
            console.error('Announcement creation failed:', err.response || err);
            setError(err.response?.data || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
                <Navbar />
                <div className="container mx-auto p-4 max-w-2xl mt-10 mb-20">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            📣 Create Announcement
                        </h1>
                        <p className="text-indigo-600 font-medium mt-1">
                            Team: {sportName}
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                        {/* Title Input */}
                        <div className="mb-5">
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Announcement Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-all"
                                placeholder="e.g., Change in Practice Schedule"
                                required
                            />
                        </div>

                        {/* Message Textarea */}
                        <div className="mb-6">
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                Message Details
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="6"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition-all"
                                placeholder="Provide all necessary details for your team members..."
                                required
                            ></textarea>
                        </div>

                        {/* Feedback States */}
                        {error && (
                            <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 mb-6 text-sm text-green-700 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                                <span>✅</span> {successMessage}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-[2] py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all ${
                                    isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                }`}
                            >
                                {isLoading ? 'Posting...' : 'Post to Team'}
                            </button>
                        </div>
                    </form>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default CreateAnnouncement;