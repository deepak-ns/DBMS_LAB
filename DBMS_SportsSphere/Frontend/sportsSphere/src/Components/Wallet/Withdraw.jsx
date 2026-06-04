import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getUserFromToken } from "../../Utils/Auth";

const WithdrawWalletPage = () => {
  const [amount, setAmount] = useState(100);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = getUserFromToken();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleWithdraw = async () => {
    setMessage("");

    if (!user) {
      setMessage("User not authenticated. Please login.");
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const resp = await axios.post(
        "http://localhost:8080/api/wallet/withdraw-money",
        {
          userId: user.id,
          password,
          amount: Number(amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

     
        setMessage(`Withdrawal successful!`);
        setAmount("");
        setPassword("");
      
    } catch (error) {
      setMessage(error.response?.data?.error || "Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 px-6 md:px-20 flex flex-col items-center text-blue-800">
        <h1 className="text-2xl font-bold mb-6">Withdraw Money from Wallet</h1>
        <input
          type="number"
          placeholder="Amount (INR)"
          className="border p-2 mb-4 w-64 text-center"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <input
          type="password"
          placeholder="Enter Password"
          className="border p-2 mb-4 w-64 text-center"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
        {message && <p className="mt-4">{message}</p>}
        <br />
        <Link to="/profile" className="bg-gray-700 text-white px-6 py-2 rounded">
          Back to Profile
        </Link>
      </div>
      <Footer />
    </>
  );
};

export default WithdrawWalletPage;
