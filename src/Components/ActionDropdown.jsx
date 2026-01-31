import React, { useRef, useEffect, useState } from 'react';
import './ActionDropdown.css';

const ActionDropdown = ({ isOpen, onClose, actions = [] }) => {
  const dropdownRef = useRef(null);
  const [openDirection, setOpenDirection] = useState('down');

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current) return;
      const target = event.target;

      // Ignore clicks inside the dropdown
      if (dropdownRef.current.contains(target)) return;

      // Ignore clicks on the toggle button
      if (target.closest('.edit-icon')) return;

      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Decide dropdown direction
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenDirection(spaceBelow < 1000 && spaceAbove > 50 ? 'up' : 'down');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ul
      ref={dropdownRef}
      className={`action-dropdown-menu list-group position-absolute z-3 
        ${openDirection === 'up' ? 'open-up' : 'open-down'}`}
    >
      {actions.map((action, idx) => (
        <li
          key={idx}
          className="list-group-item action-dropdown-item"
          onClick={() => {
            action.onClick();
            onClose();
          }}
        >
          {action.icon} {action.label}
        </li>
      ))}
    </ul>
  );
};

export default ActionDropdown;
