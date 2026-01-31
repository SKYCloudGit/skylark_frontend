import React, { useEffect, useState } from 'react';
import './HierarchySelection.css';
import { BASE_URL } from '../Services/api';

const HierarchySelection = ({
  formData,
  setFormData,
  setDropdownOptions: setDropdownOptionsProp,
}) => {
  const [titles, setTitles] = useState([]);
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [selectedRootTitleId, setSelectedRootTitleId] = useState('');

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchTitles = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/hierarchy/data/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setTitles(data);
        setFilteredTitles(data);
      } catch (error) {
        console.error('Failed to fetch titles:', error);
      }
    };

    fetchTitles();
  }, []);

  const fetchHierarchyData = async (hierarchyTitleId, parentId = null) => {
    const token = getAuthToken();
    if (!token) return [];

    const url = `/hierarchy/data/titleId=${hierarchyTitleId}${
      parentId ? `/parentId=${parentId}` : ''
    }`;

    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch hierarchy data:', error);
      return [];
    }
  };

  const buildHierarchyOrder = (titles) => {
    const map = {};
    const roots = [];

    titles.forEach((title) => {
      map[title.id] = { ...title, children: [] };
    });

    titles.forEach((title) => {
      if (title.parentTitleId) {
        const parent = map[title.parentTitleId];
        if (parent) {
          parent.children.push(map[title.id]);
        }
      } else {
        roots.push(map[title.id]);
      }
    });

    const orderedList = [];
    const visited = new Set();

    const dfs = (node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      orderedList.push(node);
      node.children.forEach(dfs);
    };

    roots.forEach(dfs);
    return orderedList;
  };

  const prepareHierarchy = async (titleList) => {
    const ordered = buildHierarchyOrder(titleList);
    const options = {};

    for (const title of ordered) {
      const dropdownData = await fetchHierarchyData(title.id);
      options[title.id] = dropdownData.map((item) => ({
        id: item.id,
        name: item.name,
      }));
    }

    setHierarchy(ordered);
    setDropdownOptions(options);

    // Expose options to parent for filtering
    if (typeof setDropdownOptionsProp === 'function') {
      setDropdownOptionsProp(options);
    }
  };

  useEffect(() => {
    if (filteredTitles.length > 0) {
      prepareHierarchy(filteredTitles);
    }
  }, [filteredTitles, selectedRootTitleId]);

  const handleParentChange = async (levelId, event) => {
    const selectedId = event.target.value;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [levelId]: selectedId,
        consumerId: selectedId,
      };

      const startIndex = hierarchy.findIndex((h) => h.id === levelId);
      for (let i = startIndex + 1; i < hierarchy.length; i++) {
        delete updatedData[hierarchy[i].id];
      }

      return updatedData;
    });

    const nextTitleIndex = hierarchy.findIndex((item) => item.id === levelId) + 1;
    if (nextTitleIndex < hierarchy.length) {
      const nextTitle = hierarchy[nextTitleIndex];
      const nextLevelData = await fetchHierarchyData(nextTitle.id, selectedId);

      setDropdownOptions((prevOptions) => {
        const newOptions = {
          ...prevOptions,
          [nextTitle.id]: nextLevelData.map((item) => ({
            id: item.id,
            name: item.name,
          })),
        };

        // Sync with parent
        if (typeof setDropdownOptionsProp === 'function') {
          setDropdownOptionsProp(newOptions);
        }

        return newOptions;
      });
    }
  };

  const handleRootFilterChange = (e) => {
    const selectedId = e.target.value;
    setSelectedRootTitleId(selectedId);
  };

  return (
    <div className="container-fluid p-2">
      {/* Root Filter Dropdown (Optional) */}
      {/* 
      <div className="mb-3">
        <label className="form-label fw-semibold">Filter by Root Title</label>
        <select
          className="form-select form-select-sm meter-dropdown"
          value={selectedRootTitleId}
          onChange={handleRootFilterChange}
        >
          <option value="">None (Top-level)</option>
          {titles
            .filter((t) => !t.parentTitleId)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </select>
      </div>
      */}

      {/* Hierarchy Dropdowns */}
      <div className="row g-2 align-items-end">
        {hierarchy.map((title) => (
          <div key={title.id} className="col-auto">
            <label htmlFor={title.id} className="form-label fw-semibold">
              {title.title}
            </label>
            <select
              id={title.id}
              className="form-select form-select-sm meter-dropdown"
              value={formData[title.id] || ''}
              onChange={(e) => handleParentChange(title.id, e)}
              disabled={!dropdownOptions[title.id] || dropdownOptions[title.id].length === 0}
            >
              <option value="">Select {title.title}</option>
              {(dropdownOptions[title.id] || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HierarchySelection;
