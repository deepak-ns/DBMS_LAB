import React, { useEffect, useState ,useCallback} from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";

// Define the API base URL
const API_BASE_URL = "http://localhost:8080/api";

// --- Helper Components: Modals ---

// 1. Password Verification Modal
const PasswordVerificationModal = ({ userId, onVerificationSuccess, onClose }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async () => {
        if (!password) {
            setError("Please enter your current password.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_BASE_URL}/auth/user/${userId}/verify-password`,
                { password: password }
            );
            onVerificationSuccess();
        } catch (err) {
            console.error("Verification error:", err);
            setError(err.response?.data || "Invalid password or verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg";
    const buttonBaseClasses = "font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Verify Identity</h2>
                <p className="text-sm text-gray-600">Enter your current password to proceed with profile update.</p>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <input
                    type="password"
                    placeholder="Current Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    disabled={loading}
                    required
                />

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={`bg-gray-300 hover:bg-gray-400 text-gray-800 ${buttonBaseClasses}`}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        className={`bg-blue-800 hover:bg-blue-900 text-white ${buttonBaseClasses}`}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Profile Update Modal
const ProfileUpdateModal = ({ userInfo, onUpdateSuccess, onClose }) => {
    // Editable fields: name, gender, department, academicYear, sportsInterested
    const [formData, setFormData] = useState({
        name: userInfo.name,
        gender: userInfo.gender || '',
        department: userInfo.department || '',
        academicYear: userInfo.academicYear || '',
        sportsInterested: Array.isArray(userInfo.sportsInterested) 
                            ? userInfo.sportsInterested.join(', ')
                            : (typeof userInfo.sportsInterested === 'string' ? userInfo.sportsInterested : '')
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            
            // 1. Convert the comma-separated string to a JavaScript Array
            const sportsArray = formData.sportsInterested
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            // 2. *** CRITICAL FIX: Convert the JavaScript Array into a JSON String ***
            const sportsJsonString = JSON.stringify(sportsArray);

            const dataToSend = {
                // Spread other form data fields
                ...formData,
                // Override the string input with the necessary JSON String format
                sportsInterested: sportsJsonString 
            };
            
            // The rest of the update logic
            await axios.put(
                `${API_BASE_URL}/auth/update-user/${userInfo.id}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${token}` } // Added token based on previous assumption/standard practice
                }
            );
            
            alert("Profile updated successfully!");
            onUpdateSuccess(); 
            onClose();

        } catch (err) {
            console.error("Update error:", err);
            // ... (error handling)
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg";
    const labelClasses = "block text-sm font-medium text-gray-700 mt-2";
    const buttonBaseClasses = "font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50";

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Update Profile</h2>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                
                <form onSubmit={handleUpdate} className="space-y-3">
                    
                    <div>
                        <label className={labelClasses}>Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Academic Year</label>
                            <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputClasses} placeholder="e.g., 2024" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Department</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} className={inputClasses} placeholder="e.g., Computer Science" />
                    </div>

                    <div>
                        <label className={labelClasses}>Sports Interested (Comma Separated)</label>
                        <input type="text" name="sportsInterested" value={formData.sportsInterested} onChange={handleChange} className={inputClasses} placeholder="e.g., Cricket, Football, Badminton" />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`bg-gray-300 hover:bg-gray-400 text-gray-800 ${buttonBaseClasses}`}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-800 hover:bg-blue-900 text-white ${buttonBaseClasses}`}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Profile Component ---

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [error, setError] = useState("");
    
    // State for modal management
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const navigate = useNavigate();
    const user = getUserFromToken();

    const fetchUser = useCallback(async () => {
        if (!user || !user.id) {
            setError("User not logged in.");
            setLoadingUser(false);
            return;
        }

        setLoadingUser(true);
        setError("");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/auth/user/${user.id}`);
            setUserInfo(res.data);
        } catch (err) {
            console.error("Fetch user error:", err);
            setError("Failed to fetch user info.");
        } finally {
            setLoadingUser(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Handlers for the update flow
    const handleUpdateClick = () => {
        setShowVerifyModal(true);
    };

    const handleVerificationSuccess = () => {
        setShowVerifyModal(false);
        setShowUpdateModal(true);
    };

    if (loadingUser) return <p className="mt-20 text-center">Loading...</p>;
    if (error) return <p className="mt-20 text-center text-red-600">{error}</p>;
    if (!userInfo) return null;

    // Helper function to safely render sports interested array/string
    const renderSports = () => {
        if (!userInfo.sportsInterested) return "None specified";

        if (Array.isArray(userInfo.sportsInterested)) {
            return userInfo.sportsInterested.join(", ");
        }
        
        // Attempt to parse JSON string if it's a string
        if (typeof userInfo.sportsInterested === 'string') {
            try {
                const parsed = JSON.parse(userInfo.sportsInterested);
                if (Array.isArray(parsed)) {
                    return parsed.join(", ");
                }
            } catch (e) {
                // If JSON parsing fails, return the raw string
                return userInfo.sportsInterested;
            }
        }
        return userInfo.sportsInterested.toString();
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white pt-24 px-6 md:px-20">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="border p-6 rounded shadow-lg max-w-xl mx-auto space-y-4 bg-gray-50">
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Role:</strong> <span className="text-blue-700 font-semibold">{userInfo.role.toUpperCase()}</span></p>
                    
                    <hr className="border-gray-200" />
                    
                    <p><strong>Gender:</strong> {userInfo.gender || 'N/A'}</p>
                    <p><strong>USN:</strong> {userInfo.usn || 'N/A'}</p>
                    <p><strong>Department:</strong> {userInfo.department || 'N/A'}</p>
                    <p><strong>Academic Year:</strong> {userInfo.academicYear || 'N/A'}</p>
                    
                    <hr className="border-gray-200" />
                    
                    <p className="text-lg font-semibold text-green-700">
                        <strong>Wallet Balance:</strong> ₹{userInfo.walletBalance ? userInfo.walletBalance.toFixed(2) : '0.00'}
                    </p>
                    <p>
                        <strong>Sports Interested:</strong> {renderSports()}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                        Created At: {new Date(userInfo.createdAt).toLocaleString()} | Updated At: {new Date(userInfo.updatedAt).toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-6">
<Link
                            to="/history"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md"
                          >
                            My History
                          </Link>
                        <Link
                            to="/wallet/topup"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md"
                          >
                            Top Up Wallet
                          </Link>
                        <Link
                            to="/wallet/withdraw"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md"
                        >
                            Withdraw Money
                        </Link>
                        {/* NEW UPDATE BUTTON */}
                        <button
                            onClick={handleUpdateClick}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md"
                        >
                            Update Profile
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
            
            <Footer />

            {/* Modals */}
            {showVerifyModal && (
                <PasswordVerificationModal
                    userId={user.id}
                    onVerificationSuccess={handleVerificationSuccess}
                    onClose={() => setShowVerifyModal(false)}
                />
            )}

            {showUpdateModal && (
                <ProfileUpdateModal
                    userInfo={userInfo}
                    onUpdateSuccess={fetchUser} // Re-fetch data on success
                    onClose={() => setShowUpdateModal(false)}
                />
            )}
        </>
    );
};

export default Profile;