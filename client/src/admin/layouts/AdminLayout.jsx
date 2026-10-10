import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const mainRef = useRef(null);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('agrinova_token');
  const userString = localStorage.getItem('agrinova_user');
  const user = userString ? JSON.parse(userString) : null;

  // Scroll main container to top on navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    navigate('/login');
  };

  // Protect route: Redirect to login if token is missing or if not an admin
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-bg-base text-charcoal dark:text-gray-100 font-sans flex flex-col md:flex-row">
      
      {/* Left Persistent/Drawer Sidebar */}
      <AdminSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Right Content Column */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#1E293B] border-b border-primary/10 shadow-xs shrink-0 z-30 relative">
          
          {/* Left Side: Mobile Menu Trigger & Dashboard Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-charcoal dark:text-gray-100/60 hover:bg-primary/5 hover:text-primary transition-colors focus:outline-none md:hidden"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">AgriNova Platform</span>
              <span className="text-base font-extrabold text-charcoal dark:text-gray-100 mt-1.5 leading-none">Admin Control Center</span>
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-charcoal dark:text-gray-100 md:hidden">
              Agri<span className="text-primary font-extrabold">Nova</span> Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Right Side: Admin Logo Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 px-3 rounded-xl hover:bg-gray-50 dark:bg-[#0F172A] dark:hover:bg-slate-800 transition-colors focus:outline-none select-none cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-emerald-700 text-white flex items-center justify-center font-display font-extrabold text-sm shadow-sm">
                  {user?.firstName?.charAt(0) || 'A'}{user?.lastName?.charAt(0) || 'S'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-extrabold text-charcoal dark:text-gray-100 leading-none">
                    {user?.firstName || 'Admin'} {user?.lastName || 'System'}
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">
                    Platform Admin
                  </span>
                </div>
                <ChevronDown className="w-4.5 h-4.5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 rounded-2xl shadow-xl py-2 z-50 text-sm font-semibold text-gray-650"
                  >
                    <Link
                      to="profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <User className="w-4.5 h-4.5 text-gray-400" />
                      <span>Admin Profile</span>
                    </Link>

                    <Link
                      to="settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <Settings className="w-4.5 h-4.5 text-gray-400" />
                      <span>System Settings</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-650 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left font-bold cursor-pointer focus:outline-none"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>Sign Out Panel</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 focus:outline-none bg-[#F8FAF5] dark:bg-[#0F172A]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pb-16 w-full max-w-7xl mx-auto"
            >
              <Outlet context={{ user }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
