import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../AuthContext";   // 👈 Add this

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const { login } = useAuth();   // 👈 access global login()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData
      );

      const token = res.data; // backend returns JWT string

      // JWT tokens are always long, so verify
      if (token && token.length > 20) {
        localStorage.setItem("token", token);

        login(); // 👈 update global logged-in state

        setMessage({
          text: "Login successful!",
          type: "success",
        });

        setTimeout(() => navigate("/"), 1200);
      } else {
        setMessage({
          text: token || "Login failed",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Login failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-32 px-6 md:px-20">
        <div className="max-w-md mx-auto bg-gray-50 p-10 rounded-2xl shadow-md">
          <h1 className="text-4xl font-bold text-black text-center mb-8">
            Log In to <br /> <span className="text-black font-light">RV SportsSphere</span>
          </h1>

          {message.text && (
            <div
              className={`mb-6 px-4 py-3 rounded-md text-center font-semibold ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
            <div>
              <label htmlFor="email" className="block font-semibold mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-semibold mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
