import { useState, useEffect } from 'react';

export const useModulePermissions = () => {
  const [permissionsMap, setPermissionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token found');

        // 1️⃣ Get user info first
        const userRes = await fetch(`/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) throw new Error('Failed to fetch user info');
        const userData = await userRes.json();

        const userId = userData?.id;
        if (!userId) throw new Error('User ID not found in response');

        // 2️⃣ Now fetch module permissions
        const permRes = await fetch(`/data/moduleAccessRight/userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!permRes.ok) throw new Error('Failed to fetch permissions');
        const permData = await permRes.json();

        if (!Array.isArray(permData)) {
          console.warn('Unexpected API response:', permData);
          if (isMounted) setPermissionsMap({});
          return;
        }

        const mappedPermissions = {};
        permData.forEach((entry) => {
          const moduleId = entry?.module?.id || entry?.moduleId;
          if (!moduleId) return;

          mappedPermissions[moduleId] = {
            name: entry.module?.name || 'Unknown Module',
            parentId: entry.module?.parentId || null,
            read: entry.read ?? false,
            write: entry.write ?? false,
            update: entry.update ?? false,
            delete: entry.delete ?? false,
          };
        });

        if (isMounted) setPermissionsMap(mappedPermissions);
      } catch (err) {
        console.error('Error fetching module permissions:', err);
        if (isMounted) {
          setPermissionsMap({});
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔥 helper functions for dynamic checks
  const canRead = (moduleName) =>
    Object.values(permissionsMap).some((p) => p.name === moduleName && p.read);

  const canWrite = (moduleName) =>
    Object.values(permissionsMap).some((p) => p.name === moduleName && p.write);

  const canUpdate = (moduleName) =>
    Object.values(permissionsMap).some((p) => p.name === moduleName && p.update);

  const canDelete = (moduleName) =>
    Object.values(permissionsMap).some((p) => p.name === moduleName && p.delete);

  return { permissionsMap, loading, error, canRead, canWrite, canUpdate, canDelete };
};
