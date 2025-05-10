// export default Layout; 
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material'; // still using MUI for Menu (optional, replace later)
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  { text: 'Subscription Details', icon: <DescriptionIcon />, path: '/subscription-details' },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    navigate('/login');
  };

  const drawer = (
    <nav className="mt-4 space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.text}
          onClick={() => {
            navigate(item.path);
            if (mobileOpen) setMobileOpen(false);
          }}
          className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-200 ${
            location.pathname === item.path ? 'bg-blue-100 text-blue-600 font-semibold' : ''
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          {item.text}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* AppBar */}
      <header className="fixed top-0 z-10 flex w-full items-center justify-between bg-blue-600 text-white px-4 py-3 md:ml-[240px] md:w-[calc(100%-240px)]">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </button>
        {/* Title */}
        <h1 className="text-lg font-semibold">
          {menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
        </h1>
        {/* Profile Avatar */}
        <button onClick={handleProfileMenuOpen}>
          <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center">
            U
          </div>
        </button>
        {/* Profile Menu (still using MUI Menu for now) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
        >
          <MenuItem onClick={() => navigate('/profile')}>
            <PersonIcon fontSize="small" className="mr-2" />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" className="mr-2" />
            Logout
          </MenuItem>
        </Menu>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-20 h-full bg-white border-r shadow-md transition-transform duration-300 md:translate-x-0 md:w-[${drawerWidth}px] ${
          mobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-4 font-bold text-lg border-b">My App</div>
        {drawer}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 mt-16 md:ml-[240px]">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
