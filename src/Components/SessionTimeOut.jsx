import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionTimeout = ({ timeout = 30 * 60 * 1000 }) => { // Default: 30 min
  const navigate = useNavigate();

  // Function to logout the user
  const logoutUser = () => {
    alert("Session expired. Redirecting to login.");
    localStorage.removeItem("authToken"); // Remove token
    navigate("/"); // Redirect to login
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Start auto logout timer
    const logoutTimer = setTimeout(logoutUser, timeout);

    return () => clearTimeout(logoutTimer); // Clear on unmount
  }, [timeout]);

  return null; // This component doesn't render anything
};

export default SessionTimeout;
