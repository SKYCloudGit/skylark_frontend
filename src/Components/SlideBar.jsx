import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { getAuthToken } from '../Services/auth';
import './SlideBar.css';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IoMdSpeedometer, IoMdGlobe } from 'react-icons/io';
import { FiDatabase, FiHardDrive } from 'react-icons/fi';
import { MdOutlineManageAccounts, MdSpaceDashboard } from 'react-icons/md';
import ErrorModal from './ErrorModal';
import { BASE_URL } from '../Services/api';

const getIcon = (name) => {
  const key = name?.toLowerCase();
  if (key?.includes('dashboard')) return <MdSpaceDashboard />;
  if (key?.includes('area')) return <IoMdGlobe />;
  if (key?.includes('device')) return <FiHardDrive />;
  if (key?.includes('user')) return <MdOutlineManageAccounts />;
  if (key?.includes('bcs')) return <FiDatabase />;
  if (key?.includes('meter')) return <IoMdSpeedometer />;
  return <IoMdSpeedometer />;
};

const SlideBar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [moduleTree, setModuleTree] = useState([]);
  const location = useLocation();

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchedRef = useRef(false);

  const activeColor = '#7c3aed';
  const hoverColor = '#f3e8ff';
  const defaultColor = '#4b5563';
  const sidebarWidth = collapsed ? 80 : 240;

  const isPathActive = (path) =>
    typeof path === 'string' && location.pathname.toLowerCase().startsWith(path.toLowerCase());

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch sidebar modules only once
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchSidebarModules = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const userRes = await fetch(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        const userId = userData.id;

        const accessRes = await fetch(`/api/data/moduleAccessRight/userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accessRights = await accessRes.json();

        const activeModules = accessRights
          .filter((item) => item.status === 'active' && item.module)
          .map((item) => item.module);

        // Build module tree
        const slugify = (str) => str.toLowerCase().replace(/\s+/g, '');
        const moduleMap = {};
        activeModules.forEach((mod) => {
          moduleMap[mod.id] = { ...mod, children: [], route: null };
        });

        const roots = [];
        activeModules.forEach((mod) => {
          const slug = slugify(mod.name);
          if (mod.parentId && moduleMap[mod.parentId]) {
            const parentSlug = slugify(moduleMap[mod.parentId].name);
            moduleMap[mod.id].route = `/${parentSlug}/${slug}`;
            moduleMap[mod.parentId].children.push(moduleMap[mod.id]);
          } else {
            const nameLower = mod.name?.toLowerCase();
            moduleMap[mod.id].route =
              nameLower === 'dashboard' || nameLower.includes('dashboard') ? '/dashboard' : null;
            roots.push(moduleMap[mod.id]);
          }
        });

        const moduleOrder = [
          'dashboard',
          'area management',
          'meter management',
          'user management',
          'bcs tool',
        ];

        roots.sort((a, b) => {
          const nameA = a.name?.toLowerCase() ?? '';
          const nameB = b.name?.toLowerCase() ?? '';
          const indexA =
            moduleOrder.findIndex((name) => nameA.includes(name)) ?? moduleOrder.length;
          const indexB =
            moduleOrder.findIndex((name) => nameB.includes(name)) ?? moduleOrder.length;
          return indexA - indexB;
        });

        setModuleTree(roots);
      } catch (err) {
        setError(true);
        setErrorMessage('❌ Failed to fetch sidebar modules');
      }
    };

    fetchSidebarModules();
  }, []);

  return (
    <div className="flex">
      <div
        className="bg-white border-r shadow-md transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        <Sidebar collapsed={collapsed} className="sidebar">
          <div className="collapse-button" style={{ textAlign: 'right', padding: '10px' }}>
            <button
              className="border rounded-full shadow-sm p-1"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
          </div>

          <div className="sidebar-scroll-container">
            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active ? hoverColor : 'white',
                  color: active ? activeColor : defaultColor,
                  borderRadius: '8px',
                  padding: '14px 20px',
                  fontWeight: active ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: hoverColor,
                    color: '#9333EA',
                  },
                }),
              }}
            >
              {moduleTree.map((mod) =>
                mod.children.length > 0 ? (
                  <SubMenu
                    key={mod.id}
                    icon={getIcon(mod.name)}
                    label={
                      <span
                        style={{
                          color: mod.children.some((c) => isPathActive(c.route))
                            ? activeColor
                            : defaultColor,
                          fontWeight: mod.children.some((c) => isPathActive(c.route))
                            ? 'bold'
                            : 'normal',
                        }}
                      >
                        {mod.name}
                      </span>
                    }
                  >
                    {mod.children.map((child) => (
                      <MenuItem
                        key={child.id}
                        component={<Link to={child.route} />}
                        active={isPathActive(child.route)}
                      >
                        {child.name}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem
                    key={mod.id}
                    icon={getIcon(mod.name)}
                    component={<Link to={mod.route} />}
                    active={isPathActive(mod.route)}
                  >
                    {mod.name}
                  </MenuItem>
                )
              )}
            </Menu>
          </div>
        </Sidebar>
      </div>

      <div className="flex-1 transition-all duration-300 p-4" style={{ overflow: 'hidden' }}>
        <Outlet />
      </div>

      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default SlideBar;
