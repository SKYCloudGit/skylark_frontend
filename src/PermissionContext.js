import React, { createContext, useState, useEffect } from 'react';
import { getAuthToken } from './Services/auth';

export const PermissionContext = createContext(); // ✅ ONLY export this once

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const userRes = await fetch(`/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      const userId = userData.id;

      const moduleRes = await fetch(`/data/moduleAccessRight/userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await moduleRes.json();

      const mapped = {};
      data.forEach((entry) => {
        const name = entry.module?.name;
        if (name) {
          mapped[name] = {
            read: entry.read,
            write: entry.write,
            update: entry.update,
            delete: entry.delete,
          };
        }
      });
      setPermissions(mapped);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};
