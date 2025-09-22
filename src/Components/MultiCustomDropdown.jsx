import React, { useState, useEffect, useRef } from "react";
import "./CustomDropdown.css";

const MultiCustomDropdown = ({
  options = [],
  value = [],
  onChange,
  displayKey = "title",
  placeholder = "Select...",
  isScrollable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSelect = (id) => {
    const newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const handleRemove = (id) => {
    const newValue = value.filter((v) => v !== id);
    onChange(newValue);
  };

  const selectedOptions = options.filter((option) => value.includes(option.id));

  return (
    <div className="mb-3 position-relative" ref={dropdownRef}>
      <div
        className={`dropdowns d-flex flex-wrap align-items-center gap-1 ${
          value.length > 0 ? "selected" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        style={{ minHeight: "38px", cursor: "pointer" }}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted">{placeholder}</span>
        ) : (
          selectedOptions.map((option) => (
            <span
              key={option.id}
              className="badge bg-light border text-dark d-flex align-items-center"
              style={{ gap: "4px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {option[displayKey]}
              <span
                style={{ cursor: "pointer", color: "#7C3AED" }}
                onClick={() => handleRemove(option.id)}
              >
                &times;
              </span>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <ul
          className={`list-group position-absolute w-100 custom-dropdown z-3 mt-1 ${
            isScrollable ? "scrollable-dropdown" : ""
          }`}
        >
          {options.map((option) => (
            <li
              key={option.id}
              className={`list-group-item custom-dropdown-item ${
                value.includes(option.id) ? "active" : ""
              }`}
              onClick={() => handleToggleSelect(option.id)}
            >
              {option[displayKey]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiCustomDropdown;
