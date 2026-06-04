import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { getUserFromToken } from "../../Utils/Auth";

const AddWalletPage = () => {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user = getUserFromToken();
  const token = localStorage.getItem("token");
  const razorpaykey = import.meta.env.VITE_RAZORPAY_KEY;

  const navigate = useNavigate();

  const loadRazorpay = (src) =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setMessage("");
    if (!user) {
      setMessage("User not authenticated. Please login.");
      return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (!razorpaykey) {
      setMessage(
        "Payment configuration error: Razorpay key is missing on the frontend. Please set VITE_RAZORPAY_KEY in your environment."
      );
      return;
    }

    setLoading(true);

    try {
      const orderResp = await axios.post(
        "http://localhost:8080/api/wallet/create-order",
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderResp.data;
      const loaded = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        setMessage("Failed to load Razorpay SDK");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpaykey,
        amount: order.amount,
        currency: order.currency,
        name: "SportsSphere Portal",
        description: "Wallet Top Up",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResp = await axios.post(
              "http://localhost:8080/api/wallet/verify-payment",
              {
                userId: user.id,
                amount: Number(amount),
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

           
              setMessage("Wallet topped up!");
              setAmount("");
              
            
          } catch (err) {
            setMessage("Payment verification failed.");
          }
        },
        prefill: {
          email: user.email,
          name: user.id, // if you want to add name, but your token doesn't have it
        },
        theme: {
          color: "#1e3a8a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage("Failed to create order. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 px-6 md:px-20 flex flex-col items-center text-blue-800">
        <h1 className="text-2xl font-bold mb-6">Add Money to Wallet</h1>
        <input
          type="number"
          placeholder="Amount (INR)"
          className="border p-2 mb-4 w-64 text-center"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
        />
        <button
          onClick={handlePayment}
          disabled={loading}
          className="bg-blue-800 text-white px-6 py-2 rounded"
        >
          {loading ? "Processing..." : "Add Money"}
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

export default AddWalletPage;
