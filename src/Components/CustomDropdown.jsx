import React, { useState, useEffect, useRef } from "react";
import './CustomDropdown.css';

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  displayKey = "title",
  placeholder = "None (Top-level)",
  isScrollable = false,
  isTopLevelAllowed = false,
  size = "md" // Accepts 'sm', 'md', 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState("down");
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

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenDirection(spaceBelow < 250 && spaceAbove > 250 ? "up" : "down");
    }
  }, [isOpen]);

  const selectedOption = options.find(option => option.id === value);
  const selectedLabel = selectedOption ? selectedOption[displayKey] : placeholder;

  return (
    <div className={`mb-3 position-relative custom-dropdown-wrapper ${size}`} ref={dropdownRef}>
      <div
        className={`dropdowns ${value !== "" ? "selected" : ""} dropdown-${size}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >               
        {selectedLabel}
      </div>

      {isOpen && (
        <ul
          className={`list-group position-absolute w-100 custom-dropdown z-3 mt-1 
            ${openDirection === "up" ? "open-up" : "open-down"} 
            ${(isScrollable || options.length > 5) ? "scrollable-dropdown" : ""}
            `}
        >
          {isTopLevelAllowed && (
            <li
              className="list-group-item custom-dropdown-item"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              {placeholder}
            </li>
          )}
          {options.map(option => (
            <li
              key={option.id}
              className={`list-group-item custom-dropdown-item ${value === option.id ? 'active' : ''}`}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
            >
              {option[displayKey]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
