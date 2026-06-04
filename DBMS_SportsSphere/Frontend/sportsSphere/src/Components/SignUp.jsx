import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student", // Changed to match your <option> values
    gender: "",
    usn: "",
    department: "",
    academicYear: "",
    sportsInterested: [],
  });

  const sportsList = [
    "Cricket", "Football", "Volleyball", "Basketball", "Throwball",
    "Badminton", "Athletics", "Swimming", "Kabaddi", "Table Tennis",
  ];

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleSport = (sport) => {
    setFormData((prev) => ({
      ...prev,
      sportsInterested: prev.sportsInterested.includes(sport)
        ? prev.sportsInterested.filter((s) => s !== sport)
        : [...prev.sportsInterested, sport],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        ...formData,
        sportsInterested: JSON.stringify(formData.sportsInterested),
      });

      setMessage({ text: "Registration successful!", type: "success" });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setMessage({
        text: err.response?.data || "Registration failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white flex justify-center items-center p-6 pt-32">
        <div className="w-full max-w-xl bg-gray-50 p-10 rounded-2xl shadow-xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-black">
            Register for <span className="text-black font-light">RV SportsSphere</span>
          </h1>

          {message.text && (
            <div className={`mb-6 px-4 py-3 rounded-md text-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 font-medium">

            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Coordinator">Coordinator</option>
            </select>

            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            {/* CONDITIONAL USN: Only for Students */}
            {formData.role === "Student" && (
              <input
                type="text"
                name="usn"
                placeholder="USN"
                required
                value={formData.usn}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}

            {/* CONDITIONAL DEPARTMENT: Only for Students and Coordinators */}
            {formData.role !== "Admin" && (
              <input
                type="text"
                name="department"
                placeholder="Department (CSE, ECE...)"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}

            {/* CONDITIONAL ACADEMIC YEAR: Only for Students */}
            {formData.role === "Student" && (
              <input
                type="text"
                name="academicYear"
                placeholder="Academic Year (2023–2027)"
                required
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            )}

            {/* CONDITIONAL SPORTS INTERESTED: Only for Students and Coordinators */}
            {formData.role !== "Admin" && (
              <div className="relative">
                <label className="block mb-1 font-semibold">
                  Sports Interested
                </label>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full border rounded-lg px-4 py-2 bg-white cursor-pointer"
                >
                  {formData.sportsInterested.length > 0
                    ? formData.sportsInterested.join(", ")
                    : "Select Sports"}
                </div>

                {dropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {sportsList.map((sport) => (
                      <label
                        key={sport}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.sportsInterested.includes(sport)}
                          onChange={() => toggleSport(sport)}
                        />
                        {sport}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-800 transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SignUp;