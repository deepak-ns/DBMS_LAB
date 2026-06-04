import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import useLocation and useNavigate
import { useAuth } from "../AuthContext";
import { FaArrowLeft } from "react-icons/fa"; // You might need to install 'react-icons' for this, or use a simple '<'

const navItemsIfLoggedIn = [
  { name: "Sports", link: "/sports" },
  { name: "Facilities", link: "/facilities" },
  { name: "Events", link: "/events" },
  { name: "Equipments", link: "/equipments" }
];

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  
  // 1. Get current location and navigation functions
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Define routes where the back button should be hidden
  const routesToHideBackButton = ["/", "/login", "/signup"];

  // 3. Check if the current route is one where the back button should be hidden
  const shouldShowBackButton = !routesToHideBackButton.includes(location.pathname);

  // 4. Function to go back (use navigate(-1))
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="py-4 fixed top-0 z-50 bg-white w-full shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">

          {/* Left Side: Back Button (if applicable) and Logo */}
          <div className="flex items-center gap-4">
            
            {/* Back Button Logic */}
            {shouldShowBackButton && (
              <button 
                onClick={goBack}
                className="text-black font-medium text-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back to the previous page"
              >
                {/* Using a simple '<' as requested, but a proper icon is better */}
                &lt; Back 
                {/* You can also use FaArrowLeft if 'react-icons' is installed: */}
                {/* <FaArrowLeft /> */}
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/rv_logo.png"
                alt="SportsSphere Logo"
                className="w-12 h-12 object-contain"
              />
              <p className="text-2xl text-black ">
                RV SportsSphere
              </p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-10">
            {isLoggedIn && navItemsIfLoggedIn.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.link}
                  className="text-black font-medium text-lg hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {/* Auth Buttons */}
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    to="/llm-model"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    Chatbot
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    My History
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notifications"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    Notifications
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="text-black font-medium text-lg hover:underline"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-black font-medium text-lg hover:underline"
                  >
                    SignUp
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Menu (No change needed here for the back button, as it's separate from the mobile menu links) */}
          <div className="dropdown dropdown-end md:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-xl w-56"
            >
              {/* Only when logged in */}
              {isLoggedIn && (
                <>
                  {navItemsIfLoggedIn.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.link}
                        className="text-black font-medium text-lg"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  
                  <li>
                    <Link
                      to="/llm-model"
                      className="text-black font-medium text-lg"
                    >
                      Chatbot
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/history"
                      className="text-black font-medium text-lg"
                    >
                      My History
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-black font-medium text-lg"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/notifications"
                      className="text-black font-medium text-lg"
                    >
                      Notifications
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={logout}
                      className="text-black font-medium text-lg"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}

              {/* Only when logged out */}
              {!isLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-black text-lg font-medium"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="text-black text-lg font-medium"
                    >
                      SignUp
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;