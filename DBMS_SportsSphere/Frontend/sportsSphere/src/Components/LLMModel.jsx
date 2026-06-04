import React, { useState, useRef } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import axios from "axios";

const LLMModel = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  // 🎤 START / STOP LISTENING (Continuous)
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (!listening) {
      // Start listening
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "en-US";
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        setQuestion(fullTranscript.trim());
      };

      recognition.onerror = () => {
        setListening(false);
        alert("Voice recognition error. Try again.");
      };

      recognition.onend = () => {
        if (listening) recognition.start(); // restart for continuous mode
      };

      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } else {
      // Stop listening
      recognitionRef.current?.stop();
      setListening(false);
    }
  };

  // 🔊 TEXT-TO-SPEECH
  const speakResponse = () => {
    if (!response) return;
    const utter = new SpeechSynthesisUtterance(response);
    utter.rate = 1;
    utter.pitch = 1;
    synth.speak(utter);
  };

  // 🚀 SEND QUESTION TO LLM
  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse("");

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:8080/api/llm/ask",
        { question },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(res.data);
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        if (error.response.data === "JWT_EXPIRED") {
          setResponse("Session expired. Please log in again.");
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }

        if (error.response.data === "INVALID_JWT") {
          setResponse("Invalid session. Please log in again.");
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }
      }

      setResponse("Error contacting the AI server.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white pt-24 text-black">
        <Navbar />

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-[#ffffff] p-8 rounded-xl shadow-lg w-full max-w-2xl border border-gray-700">

            <h2 className="text-3xl font-bold mb-3 text-center text-black">
              RV SportsSphere AI
            </h2>

            <p className="text-center text-gray-400 text-sm">
              NOTE: This chatbot responds only to portal-related questions.
            </p>

            {/* INPUT */}
            <textarea
              className="w-full bg-gray-100 border border-gray-600 rounded-lg p-3 text-lg text-black mt-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            {/* BUTTONS */}
            <div className="flex items-center gap-3 mt-3">

              {/* 🎤 SPEAK / STOP */}
              <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded-lg text-white font-semibold ${
                  listening
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {listening ? "⏹ Stop" : "🎤 Speak"}
              </button>

              {/* ASK */}
              <button
                onClick={handleAsk}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-lg font-semibold hover:bg-gray-700"
              >
                {loading ? "Loading..." : "Ask"}
              </button>
            </div>

            {/* RESPONSE */}
            {response && (
              <div className="mt-6 p-4 bg-gray-100 border border-gray-600 rounded-lg text-lg whitespace-pre-wrap relative text-black">

                {/* HEAR BUTTON (Top Right) */}
                <button
                  onClick={speakResponse}
                  className="absolute top-2 right-2  text-white text-sm px-3 py-1 rounded-md hover:bg-gray-200"
                >
                  🔊
                </button>

                {response}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default LLMModel;
