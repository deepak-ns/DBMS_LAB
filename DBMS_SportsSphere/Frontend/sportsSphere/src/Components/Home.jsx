import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";


const Home = () => {
  return (
    <>
      <Navbar/>

      <div className="min-h-screen bg-white pt-32 px-6 md:px-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-black mb-6">
            Welcome to 
          </h1>
          <h1 className="text-5xl text-black mb-6">
             RV SportsSphere
          </h1>
          
         

          <p className="mt-6 text-lg md:text-xl text-gray-700">
            Your all-in-one college sports platform to{" "}
            <span className="font-semibold text-black">
              view facilities, book courts, join events, and rent equipment
            </span>
            — all in one place.
          </p>

          {/* Hero Button */}
          <div className="mt-10">
            <Link
              to="/facilities"
              className="inline-block bg-black text-white px-10 py-3 rounded-full text-lg font-semibold transition hover:bg-blue-900"
            >
              Explore Facilities
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center bg-white border rounded-2xl shadow-lg">

            {/* Left Content */}
            <div className="md:w-1/2 p-10">
              <h2 className="text-4xl font-bold text-black mb-6">
                Key Features
              </h2>

              <ul className="space-y-5 text-gray-800 text-base leading-relaxed">

                {/* Facility Viewing */}
                <li>
                  🏟️{" "}
                  <span className="font-semibold text-black">
                    Facility & Court Viewing:
                  </span>{" "}
                  Browse all sports facilities and view real-time availability of courts.
                </li>

                {/* Court Booking */}
                <li>
                  📅{" "}
                  <span className="font-semibold text-black">
                    Court Booking System:
                  </span>{" "}
                  Book courts for 1–2 hour slots with instant slot blocking and payment confirmation.
                </li>

                {/* Wallet */}
                <li>
                  💳{" "}
                  <span className="font-semibold text-black">
                    Virtual Wallet & Payments:
                  </span>{" "}
                  Add money via UPI/Card, track balance, and auto-pay for bookings.
                </li>

                {/* Equipment Rental */}
                <li>
                  🏏{" "}
                  <span className="font-semibold text-black">
                    Sports Equipment Rental:
                  </span>{" "}
                  Rent rackets, cricket kits, footballs, etc. Admin tracks returns.
                </li>

                {/* Events */}
                <li>
                  📢{" "}
                  <span className="font-semibold text-black">
                    Events & Notifications:
                  </span>{" "}
                  View tournaments, team selections, match updates, and receive reminders.
                </li>
              </ul>

              {/* Button */}
              <div className="mt-8">
                <Link
                  to="/events"
                  className="inline-block bg-black text-white px-10 py-3 rounded-full text-lg font-semibold transition hover:bg-blue-900"
                >
                  View Events
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="md:w-1/2">
              <img
                src="/home_page_image.jpg"
                alt="Sports"
                className="w-full h-full object-cover rounded-r-2xl"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer/>

   
    </>
  );
};

export default Home;
