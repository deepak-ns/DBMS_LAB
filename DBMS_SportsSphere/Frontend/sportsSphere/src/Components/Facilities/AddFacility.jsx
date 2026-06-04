import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../Utils/Auth";

const API_BASE_URL = "http://localhost:8080/api";

const AddFacility = () => {
    const navigate = useNavigate();
    const user = getUserFromToken();
    const isAdmin = user?.role?.toLowerCase() === "admin";

    const [facility, setFacility] = useState({
        name: "",
        location: "",
        description: "",
        isActive: true
    });

    const [sports, setSports] = useState([]);
    const [selectedSportId, setSelectedSportId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* 🔑 Auth Headers */
    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    /* 🔹 Fetch all sports */
    useEffect(() => {
        if (!isAdmin) {
            setError("Access denied. Admins only.");
            setLoading(false);
            return;
        }

        axios
            .get(`${API_BASE_URL}/sports/all`, getAuthHeaders())
            .then(res => setSports(res.data))
            .catch(err => {
                console.error(err);
                setError("Failed to load sports list.");
            })
            .finally(() => setLoading(false));
    }, [isAdmin]);

    /* 🔹 Form handlers */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFacility(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    /* 🔹 Filter sports by name */
    const filteredSports = sports.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* 🔹 Submit */
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!selectedSportId) {
            setError("Please select a sport.");
            return;
        }

        axios
            .post(
                `${API_BASE_URL}/facilities/add?sportId=${selectedSportId}`,
                facility,
                getAuthHeaders()
            )
            .then(() => {
                alert("Facility created successfully!");
                navigate("/facilities");
            })
            .catch(err => {
                console.error(err);
                setError("Facility creation failed.");
            });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24">
                <Navbar />
                <div className="text-center mt-10 text-lg">Loading...</div>
                <Footer />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-24">
                <Navbar />
                <div className="text-center mt-10 text-red-600 font-bold">
                    {error}
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-xl flex-grow">
                <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
                    ➕ Add New Facility
                </h1>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl space-y-5">

                    <input
                        type="text"
                        name="name"
                        placeholder="Facility Name"
                        value={facility.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />

                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={facility.location}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={facility.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border rounded-lg"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={facility.isActive}
                            onChange={handleChange}
                        />
                        <label>Facility is Active</label>
                    </div>

                    {/* 🔹 Sport Selection */}
                    <h2 className="font-semibold text-lg pt-4">Select Sport</h2>

                    <input
                        type="text"
                        placeholder="Search sport by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                    />

                    <select
                        value={selectedSportId}
                        onChange={(e) => setSelectedSportId(e.target.value)}
                        required
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="">-- Select Sport --</option>
                        {filteredSports.map(sport => (
                            <option key={sport.id} value={sport.id}>
                                {sport.name}
                            </option>
                        ))}
                    </select>

                    {error && <p className="text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                    >
                        Create Facility
                    </button>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default AddFacility;
