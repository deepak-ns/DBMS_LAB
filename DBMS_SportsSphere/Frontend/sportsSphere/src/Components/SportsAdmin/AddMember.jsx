import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Footer from '../Footer';

const API_BASE_URL = 'http://localhost:8080/api';

const initialHealthProfile = {
    weightKg: null,
    heightCm: null,
    bloodGroup: '',
    staminaScore: null,
    injuryReports: '',
    bmi: null
};

// --- Modal Component ---
const HealthProfileModal = ({ student, onClose, onSave }) => {
    const [hpData, setHpData] = useState(initialHealthProfile);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setHpData(prev => ({
            ...prev,
            [name]: ['weightKg', 'heightCm', 'staminaScore'].includes(name) 
                ? (value === '' ? null : Number(value)) 
                : value
        }));
    };

    const handleCalculateBMI = () => {
        const { weightKg, heightCm } = hpData;
        if (weightKg && heightCm) {
            const bmi = weightKg / Math.pow(heightCm / 100, 2);
            setHpData(prev => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }));
        } else {
            alert("Please enter Weight and Height.");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-bold border-b pb-2 mb-4">Health Profile: {student.name}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(student.id, hpData); }}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Weight (kg)</label>
                            <input type="number" step="0.1" name="weightKg" onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Height (cm)</label>
                            <input type="number" step="0.1" name="heightCm" onChange={handleChange} className="w-full p-2 border rounded" required />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={handleCalculateBMI} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Calculate BMI</button>
                        <span className="font-bold">BMI: {hpData.bmi || 'N/A'}</span>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Blood Group</label>
                        <input type="text" name="bloodGroup" onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Injury Reports</label>
                        <textarea name="injuryReports" onChange={handleChange} className="w-full p-2 border rounded h-20" />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded">Save & Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Component ---
const AddMember = () => {
    const { sportId } = useParams();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [memberIdSet, setMemberIdSet] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [studentToAdd, setStudentToAdd] = useState(null);

    // 1. Fetch Existing Members (to show "Already Added")
    const fetchExistingMembers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE_URL}/sports/get/${sportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const memberIds = (res.data.members || []).map(m => m.id);
            setMemberIdSet(new Set(memberIds));
        } catch (err) {
            console.error("Failed to fetch sport members", err);
        }
    }, [sportId]);

    // 2. Fetch All Students
    const fetchStudents = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/user/students`);
            const list = Array.isArray(response.data) ? response.data.filter(u => u.role !== "Coordinator") : [];
            setStudents(list);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExistingMembers();
        fetchStudents();
    }, [fetchExistingMembers, fetchStudents]);

    // 3. Add Member Logic
    const handleAddMember = async (userId, hpData) => {
        setIsAdding(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/sports/${sportId}/add-member/${userId}`, hpData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Critical fix: Update the Set to reflect change immediately
            setMemberIdSet(prev => new Set(prev).add(userId));
            setStudentToAdd(null);
            alert("Member added successfully!");
        } catch (err) {
            alert(`Error: ${err.response?.data || "Failed to add member"}`);
        } finally {
            setIsAdding(false);
        }
    };

    // Filtered students based on search
    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center pt-20">Loading...</div>;

    return (
        <>
        <div className="min-h-screen bg-gray-50 pt-24">
            <Navbar />
            <main className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Add Team Members</h1>
                
                <input
                    type="text"
                    placeholder="Search name..."
                    className="w-full p-3 mb-6 border rounded shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">USN</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4">{student.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{student.usn || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {memberIdSet.has(student.id) ? (
                                            <span className="text-green-600 bg-green-100 px-3 py-1 rounded text-xs font-bold">Already Added</span>
                                        ) : (
                                            <button
                                                onClick={() => setStudentToAdd(student)}
                                                disabled={isAdding}
                                                className="bg-blue-800 text-white px-4 py-1 rounded text-xs hover:bg-blue-900"
                                            >
                                                Add Member
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
          
            {studentToAdd && <HealthProfileModal student={studentToAdd} onClose={() => setStudentToAdd(null)} onSave={handleAddMember} />}
        </div>
          <Footer />
          </>
    );
};

export default AddMember;