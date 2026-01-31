import React, { useState, useEffect } from 'react';
import CustomDropdown from '../Components/CustomDropdown';
import { BASE_URL } from '../Services/api';

const AssignAreaDialog = ({ show, onClose, userId, onAssign }) => {
  const [titles, setTitles] = useState([]);
  const [orderedTitles, setOrderedTitles] = useState([]);
  const [activeTitle, setActiveTitle] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);

  const getAuthToken = () => localStorage.getItem('authToken');

  // 🔹 Step 1: Fetch all titles
  useEffect(() => {
    const fetchTitles = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const res = await fetch(`/api/hierarchy/titles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // 🔹 Step 2: Filter out "Consumer"
        const filtered = data.filter((t) => t.title !== 'Consumer');
        setTitles(filtered);

        // 🔹 Step 3: Build order (root → children → grandchildren …)
        const buildOrder = (titles) => {
          const map = {};
          const roots = [];

          titles.forEach((t) => {
            map[t.id] = { ...t, children: [] };
          });

          titles.forEach((t) => {
            if (t.parentTitleId) {
              if (map[t.parentTitleId]) {
                map[t.parentTitleId].children.push(map[t.id]);
              }
            } else {
              roots.push(map[t.id]); // parentId = null → root
            }
          });

          const ordered = [];
          const dfs = (node) => {
            ordered.push(node);
            node.children.forEach((child) => dfs(child));
          };
          roots.forEach((root) => dfs(root));

          return ordered;
        };

        const ordered = buildOrder(filtered);
        setOrderedTitles(ordered);

        if (ordered.length > 0) {
          setActiveTitle(ordered[0].id); // default to first
        }
      } catch (err) {
        console.error('Failed to fetch titles', err);
      }
    };

    fetchTitles();
  }, []);

  // 🔹 Step 4: Fetch data whenever activeTitle changes
  useEffect(() => {
    if (!activeTitle) return;

    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const res = await fetch(`/api/hierarchy/data/titleId=${activeTitle}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOptions(data.map((d) => ({ id: d.id, name: d.name })));
        setSelectedValue(null);
      } catch (err) {
        console.error('Failed to fetch hierarchy data', err);
        setOptions([]);
      }
    };

    fetchData();
  }, [activeTitle]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Assign Area</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* 🔹 Buttons in hierarchy order */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {orderedTitles.map((t) => (
                <button
                  key={t.id}
                  className={`submit-buttons ${
                    activeTitle === t.id ? 'text-white' : 'text-dark bg-transparent'
                  }`}
                  onClick={() => setActiveTitle(t.id)}
                  style={
                    activeTitle === t.id
                      ? { backgroundColor: '#7C3AED', borderColor: '#7C3AED' }
                      : { borderColor: '#7C3AED' }
                  }
                >
                  {t.title}
                </button>
              ))}
            </div>

            {/* 🔹 Dropdown for current selection */}
            <label className="label-heading small">
              Select {orderedTitles.find((t) => t.id === activeTitle)?.title}:
            </label>
            <CustomDropdown
              options={options}
              value={selectedValue}
              onChange={(val) => setSelectedValue(val)}
              displayKey="name"
              placeholder="Select option"
            />
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-primary"
              disabled={!selectedValue}
              onClick={() => {
                onAssign(userId, selectedValue);
                onClose();
              }}
            >
              Assign
            </button>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignAreaDialog;
