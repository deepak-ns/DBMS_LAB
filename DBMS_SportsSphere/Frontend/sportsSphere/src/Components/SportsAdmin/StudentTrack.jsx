import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// Assume these components are created and imported
import Navbar from '../Navbar'; 
import Footer from '../Footer'; 

// --- Constants ---
// Replace with your actual API base URL
const API_BASE_URL = 'http://localhost:8080/api'; 

// --- UpdateHealthForm Component ---

const UpdateHealthForm = ({ profile, studentId, onUpdateSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    weightKg: profile.weightKg || '',
    heightCm: profile.heightCm || '',
    bloodGroup: profile.bloodGroup || '',
    staminaScore: profile.staminaScore || '',
    injuryReports: profile.injuryReports || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBMI = (weight, height) => {
    if (weight > 0 && height > 0) {
        // height is in cm, convert to meters
        const heightM = height / 100;
        // BMI = weight / (height * height)
        return (weight / (heightM * heightM)).toFixed(2);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateError(null);

    const token = getToken();
    if (!token) {
        setUpdateError("Authentication token not found.");
        setIsSubmitting(false);
        return;
    }

    // 1. Create the data payload for the API
    const dataToSend = {};

    // Only include fields that have been modified or are required
    // The backend logic will handle null checks, so we send the new values.
    // If a field is empty in the form, we should send null to clear it OR 
    // send the original value if it wasn't touched. For simplicity and 
    // to align with the "only update non-null fields" backend logic, 
    // we'll send all filled fields or null for empty numerical/string fields.
    
    // Parse numerical values, default to null if empty/invalid
    const weightKg = parseFloat(formData.weightKg) || null;
    const heightCm = parseFloat(formData.heightCm) || null;
    
    // Calculate BMI based on the *new* weight/height (or existing if not changed)
    const newBmi = calculateBMI(
        weightKg || profile.weightKg, 
        heightCm || profile.heightCm
    );

    // Prepare the final payload, ensuring empty strings for optional fields are treated as null/empty
    dataToSend.weightKg = weightKg;
    dataToSend.heightCm = heightCm;
    dataToSend.bmi = newBmi;
    dataToSend.bloodGroup = formData.bloodGroup || null;
    dataToSend.staminaScore = parseInt(formData.staminaScore) || null;
    dataToSend.injuryReports = formData.injuryReports || null;
    
    // Ensure all data in the payload is what you want the backend to process
    // The backend should use this data to update ONLY the non-null fields.

    try {
      const url = `${API_BASE_URL}/sports/update-health/${studentId}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Send the request
      const response = await axios.put(url, dataToSend, config);

      // On success, notify the parent component and close the form
      onUpdateSuccess(response.data);
      alert('Health Profile updated successfully!');
      
    } catch (err) {
      console.error("Health Profile update error:", err.response ? err.response.data : err.message);
      setUpdateError(err.response?.data?.message || "Failed to update health profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-3">
        <h4 className="text-lg font-bold text-gray-700">Update Profile (Student ID: {studentId})</h4>
        
        {updateError && <div className="p-2 text-sm text-red-700 bg-red-100 rounded">{updateError}</div>}

        <div className="grid grid-cols-2 gap-3">
            <label className="block">
                <span className="text-gray-700 text-sm">Weight (kg):</span>
                <input type="number" name="weightKg" value={formData.weightKg} onChange={handleChange} step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. 75.5" />
            </label>
            <label className="block">
                <span className="text-gray-700 text-sm">Height (cm):</span>
                <input type="number" name="heightCm" value={formData.heightCm} onChange={handleChange} step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. 170" />
            </label>
            <label className="block">
                <span className="text-gray-700 text-sm">Blood Group:</span>
                <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. O+" />
            </label>
            <label className="block">
                <span className="text-gray-700 text-sm">Stamina Score (0-100):</span>
                <input type="number" name="staminaScore" value={formData.staminaScore} onChange={handleChange} min="0" max="100" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g. 85" />
            </label>
        </div>

        <label className="block">
            <span className="text-gray-700 text-sm">Injury Reports:</span>
            <textarea name="injuryReports" value={formData.injuryReports} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"></textarea>
        </label>

        <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-4 py-2 text-sm font-medium text-white rounded-md ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
        </div>
    </form>
  );
};

// --- StudentTrack Component Definition ---

const StudentTrack = () => {
  // Extract route parameters
  const { studentId, sportId } = useParams();

  // State to hold fetched data
  const [healthProfile, setHealthProfile] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // New state for editing mode

  // Function to get the JWT token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Unified data fetching function
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      try {
        // 1. Fetch Health Profile
        // Corrected API URL structure based on your controller
        const healthUrl = `${API_BASE_URL}/health/user/${studentId}`; 
        const healthResponse = await axios.get(healthUrl, config);
        setHealthProfile(healthResponse.data);

        // 2. Fetch Training Sessions (Bookings)
        // Corrected API URL structure based on your controller
        const bookingsUrl = `${API_BASE_URL}/sports/${sportId}/progress/${studentId}`; 
        const bookingsResponse = await axios.get(bookingsUrl, config);
        setTrainingSessions(bookingsResponse.data);
        
      } catch (err) {
        console.error("Data fetching error:", err);
        setError("Failed to load student data. Please check the network and API.");
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId && sportId) {
      fetchData();
    }
  }, [studentId, sportId]);


  // Handler for successful update from the form
  const handleUpdateSuccess = (updatedProfile) => {
    setHealthProfile(updatedProfile);
    setIsEditing(false); // Close the form
  };

  // --- Helper Functions for Rendering ---

  const renderHealthProfile = () => {
    if (!healthProfile) {
      return <p>No health profile data available.</p>;
    }
    const profile = healthProfile;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };
    
    const formatValue = (value) => (value !== null && value !== undefined && value !== '') ? value : 'N/A';
    
    // Calculate BMI if not provided by the backend (or for display consistency)
    const bmiDisplay = formatValue(profile.bmi);

    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-indigo-700">Health Overview</h3>
        <div className="space-y-2">
          <p><strong>Weight:</strong> {formatValue(profile.weightKg)} kg</p>
          <p><strong>Height:</strong> {formatValue(profile.heightCm)} cm</p>
          <p><strong>BMI:</strong> {bmiDisplay}</p>
          <p><strong>Blood Group:</strong> {formatValue(profile.bloodGroup)}</p>
          <p><strong>Stamina Score:</strong> <span className="text-2xl font-bold text-green-600">{formatValue(profile.staminaScore)}</span> / 100</p>
          <p className="text-xs text-gray-500">Last Updated: {formatDate(profile.updatedAt)}</p>
        </div>
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Injury Reports:</p>
          <p className="whitespace-pre-wrap text-sm">{formatValue(profile.injuryReports)}</p>
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150"
        >
          Update Health Profile
        </button>
      </div>
    );
  };
  
 const renderTrainingSessions = () => {
    // Note: Assuming 'trainingSessions' is passed as an argument or available in scope.
    // ... (Your existing renderTrainingSessions function remains here, no change needed)
    
    // Use all sessions, no filtering based on bookingStatus
    const allSessions = trainingSessions; 

    if (allSessions.length === 0) {
      return <p>No training sessions found for this Student</p>;
    }

    // Group bookings by date
    const sessionsByDate = allSessions.reduce((acc, session) => {
        // Construct full datetime strings from slot fields for accurate Date object creation
        const startDateTimeString = `${session.slot.date}T${session.slot.startTime}:00`;
        const endDateTimeString = `${session.slot.date}T${session.slot.endTime}:00`;
        
        const startTime = new Date(startDateTimeString);
        const endTime = new Date(endDateTimeString);

        // Use the date part for grouping
        // Note: Using toLocaleDateString() might change based on the user's locale. 
        // A simple YYYY-MM-DD format might be more robust for grouping/sorting.
        const dateKey = session.slot.date; 

        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: new Date(dateKey).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                sessions: 0,
                durationMinutes: 0,
                slots: []
            };
        }
        acc[dateKey].sessions += 1;
        
        // Calculate duration in minutes
        const durationMs = endTime.getTime() - startTime.getTime();
        const duration = durationMs / (1000 * 60); 

        acc[dateKey].durationMinutes += duration;
        acc[dateKey].slots.push({
            time: `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                   ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            duration: `${Math.round(duration)} mins`,
            bookingStatus: session.bookingStatus // Include status for full detail
        });
        return acc;
    }, {});
    
    const progressData = Object.values(sessionsByDate).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate total sessions across all dates for the summary
    const totalSessionsCount = allSessions.length;


    return (
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-indigo-700">Training Sessions ({totalSessionsCount} Total)</h3>
        
        <div className="mb-4">
            <p className="text-lg"><strong>Total Sessions Logged:</strong> <span className="font-bold text-blue-600">{totalSessionsCount}</span></p>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {progressData.map((day, index) => (
            <div key={index} className="border-b pb-3">
              <p className="font-bold text-lg text-gray-800">📅 {day.date}</p>
              <p className="text-sm text-gray-600">Total Practice Time: <span className="font-medium text-green-700">{Math.floor(day.durationMinutes / 60)} hours {Math.round(day.durationMinutes % 60)} mins</span> ({day.sessions} Sessions)</p>
              <ul className="list-disc list-inside text-sm mt-1 ml-2">
                  {day.slots.map((slot, sIndex) => (
                      <li key={sIndex} className={slot.bookingStatus === 'approved' ? 'text-gray-700' : 'text-orange-500'}>
                          {slot.time} ({slot.duration}) 
                      </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
};

  // --- Main Render Logic ---

  if (isLoading) {
    // ... (Existing loading state)
    return (
      <>
        <Navbar />
        <div className="p-6 text-center">
          <p>Loading student track data for Student ID: **{studentId}** and Facility ID: **{sportId}**...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    // ... (Existing error state)
    return (
      <>
        <Navbar />
        <div className="p-6 text-center text-red-600">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />
      
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
          Student Progress Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Half: Health Profile & Update Form */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">⚕️ Health Profile</h2>
            
            {/* Conditional Rendering for Edit Form */}
            {isEditing && healthProfile ? (
                <UpdateHealthForm 
                    profile={healthProfile} 
                    studentId={studentId} 
                    onUpdateSuccess={handleUpdateSuccess}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                renderHealthProfile()
            )}
            
          </div>
          
          {/* Second Half: Training Sessions/Progress */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">🏋️ Training Sessions (Bookings)</h2>
            {renderTrainingSessions()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentTrack;