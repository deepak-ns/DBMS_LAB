import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";

const API_BASE_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const SportsTeam = () => {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSport = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/sports/get/${sportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSport(res.data);
    } catch (err) {
      console.error("Failed to fetch sport", err);
    } finally {
      setLoading(false);
    }
  }, [sportId]);

  useEffect(() => {
    fetchSport();
  }, [fetchSport]);

  // --- Logic for Removing a Member ---
  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    try {
      const token = getToken();
      // Adjusting to your requested route: /api/sports/{sportId}/remove-member/{userId}
      await axios.delete(`${API_BASE_URL}/sports/${sportId}/remove-member/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Member removed successfully.");
      fetchSport(); // Refresh the list after deletion
    } catch (err) {
      console.error("Error removing member:", err);
      alert(err.response?.data || "Failed to remove member.");
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;
  if (!sport) return <div className="pt-24 text-center">Sport not found</div>;

  const members = sport.members || [];
  const coordinator = sport.coordinator;
  const isCoordinator = user?.id === coordinator?.id;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24">
        <Navbar />

        <main className="container mx-auto p-6 flex flex-col md:flex-row gap-8">
          {/* MEMBERS SECTION */}
          <div className="md:w-1/2 bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold">
                {sport.name} Team ({members.length})
              </h2>

              {isCoordinator && (
                <button
                  onClick={() => navigate(`/sports/${sportId}/add-member`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                >
                  + Add Member
                </button>
              )}
            </div>

            {members.length > 0 ? (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded mb-2"
                >
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-600 uppercase">
                      {m.department || "General"}
                    </p>
                  </div>

                  {/* COORDINATOR ACTIONS */}
                  {isCoordinator && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/sports/${sportId}/student/${m.id}`)}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-xs transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No members in this team yet.</p>
            )}
          </div>

          {/* COORDINATOR SECTION */}
<div className="md:w-1/2 bg-blue-50 p-6 rounded shadow self-start">
  <h2 className="text-xl font-bold mb-4">Team Coordinator</h2>
  {coordinator ? (
    <div className="bg-white p-4 rounded border border-blue-100">
      <p className="font-bold text-blue-900">Name: {coordinator.name}</p>
      <p className="text-sm text-gray-700">Contact: {coordinator.email}</p>
      {isCoordinator && (
        <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
          You are the Coordinator
        </span>
      )}

      {/* ANNOUNCEMENT BUTTONS */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => navigate(`/announcements/${sportId}`)}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          View Announcements
        </button>

        {isCoordinator && (
          <button
            onClick={() => navigate(`/announcements/${sportId}/create`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Make an Announcement
          </button>
        )}
      </div>
    </div>
  ) : (
    <p className="text-gray-500 italic">No coordinator assigned</p>
  )}
</div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SportsTeam;