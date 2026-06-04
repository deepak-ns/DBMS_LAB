import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

// Helper function to decode JWT and check expiration
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // JWT format: Header.Payload.Signature. We want the Payload (index 1).
    const payloadBase64 = token.split(".")[1];
    
    // Fallback if token format is wrong
    if (!payloadBase64) return true; 

    // Base64URL decoding for the payload.
    // Replace non-standard base64 characters ('-' and '_') with standard ones ('+' and '/')
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode the base64 string and parse the JSON payload
    const payloadJson = atob(base64);
    const { exp } = JSON.parse(payloadJson);

    // 'exp' is the expiration time in seconds (Epoch time).
    // Convert to milliseconds and check if the current time is greater than or equal to the expiration time.
    const currentTime = Date.now();
    const expirationTime = exp * 1000;

    return currentTime >= expirationTime;

  } catch (error) {
    // If decoding or parsing fails, the token is invalid. Treat as expired.
    console.error("Failed to decode token or check expiration. Treating as expired.", error);
    return true; 
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Define logout here so it can be used inside the useEffect
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        // If the token exists but is expired, clear the session.
        console.warn("Authentication token found, but it is expired. Logging out automatically.");
        alert("Your session has expired. Please log in again.");
        logout();
      } else {
        // Token exists and is valid. Set the user as logged in.
        setIsLoggedIn(true);
      }
    } else {
      // No token, not logged in.
      setIsLoggedIn(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = () => setIsLoggedIn(true);
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}> 
      {children} 
    </AuthContext.Provider>
  );
};

// Hook to use auth
export const useAuth = () => useContext(AuthContext);