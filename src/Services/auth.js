export const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You are not authenticated. Please log in.");
      return null;
    }
    return token;
  };
  