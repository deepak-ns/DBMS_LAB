import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getUserFromToken } from "../Utils/Auth";
import { useNavigate } from "react-router-dom";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    sportType: "",
    date: "",
    time: "",
    venue: "",
    registrationLink: "",
  });

  const user = getUserFromToken();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/events/all",
          config
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // DELETE EVENT
  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/events/delete/${eventId}`,
        config
      );
      setEvents((prev) => prev.filter((ev) => ev.eventId !== eventId));
      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete event.");
    }
  };

  // START EDIT
  const startEdit = (ev) => {
    setEditingEventId(ev.eventId);
    setEditData({
      title: ev.title,
      description: ev.description,
      sportType: ev.sportType,
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      registrationLink: ev.registrationLink,
    });
  };

  // UPDATE EVENT
  const handleUpdate = async (eventId) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/events/update/${eventId}`,
        editData,
        config
      );

      setEvents((prev) =>
        prev.map((ev) => (ev.eventId === eventId ? res.data : ev))
      );

      setEditingEventId(null);
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update event.");
    }
  };

  if (loading)
    return <div className="p-20 text-center text-xl">Loading Events...</div>;

  return (
    <>
      <Navbar />

      <div className="pt-28 px-6 min-h-screen bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Events</h1>

          {user?.role?.toUpperCase().includes("ADMIN") && (
            <button
              onClick={() => navigate("/add-event")}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + Add Event
            </button>
          )}
        </div>

        {/* EVENTS LIST */}
        <div className="space-y-6 max-h-[70vh] overflow-y-scroll pr-3">
          {events.length === 0 ? (
            <p className="text-gray-600 text-center">No events available.</p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.eventId}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
              >
                {editingEventId !== ev.eventId ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-2">{ev.title}</h2>
                    <p className="text-gray-700 mb-3">{ev.description}</p>

                    <div className="text-gray-600 space-y-1">
                      <p>
                        <strong>Sport: </strong>
                        {ev.sportType}
                      </p>
                      <p>
                        <strong>Date: </strong>
                        {ev.date}
                      </p>
                      <p>
                        <strong>Time: </strong>
                        {ev.time}
                      </p>
                      <p>
                        <strong>Venue: </strong>
                        {ev.venue}
                      </p>

                      {ev.registrationLink && (
                        <a
                          href={ev.registrationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Register Here
                        </a>
                      )}
                    </div>

                    {/* ADMIN BUTTONS */}
                    {user?.role?.toUpperCase().includes("ADMIN") && (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => startEdit(ev)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-400"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => handleDelete(ev.eventId)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">
                      Edit Event #{ev.eventId}
                    </h2>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <textarea
                        placeholder="Description"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Sport"
                        value={editData.sportType}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            sportType: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({ ...editData, date: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <input
                        type="time"
                        value={editData.time}
                        onChange={(e) =>
                          setEditData({ ...editData, time: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Venue"
                        value={editData.venue}
                        onChange={(e) =>
                          setEditData({ ...editData, venue: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <input
                        type="text"
                        placeholder="Registration Link"
                        value={editData.registrationLink}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            registrationLink: e.target.value,
                          })
                        }
                        className="w-full border px-3 py-2 rounded-lg"
                      />

                      <div className="flex gap-4 mt-3">
                        <button
                          onClick={() => handleUpdate(ev.eventId)}
                          className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditingEventId(null)}
                          className="bg-gray-500 text-white w-full py-2 rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default EventsPage;
