import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./GoBack.css"; // Import CSS for styling

const BackButton = ({ customStyle }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button className="back-button" style={customStyle} onClick={handleBack}>
      <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "5px" }} />
      <span className="tooltip">Go back</span>
    </button>
  );
};

export default BackButton;
