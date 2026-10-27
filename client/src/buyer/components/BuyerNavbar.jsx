import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, Globe, User, Settings, LogOut, ChevronDown, 
  ShoppingBag, ClipboardList, Users, CloudSun, Heart, ShoppingCart,
  MessageSquare, HelpCircle, ShieldCheck, LayoutDashboard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

export default function BuyerNavbar({ user: propUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const [user, setUser] = useState(propUser || null);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync user changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('agrinova_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen to custom event to update cart/wishlist count
  useEffect(() => {
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
      const wish = JSON.parse(localStorage.getItem('agrinova_wishlist') || '[]');
      setCartCount(cart.length);
      setWishCount(wish.length);
    };
    
    updateCounts();
    window.addEventListener('cart_updated', updateCounts);
    window.addEventListener('wishlist_updated', updateCounts);
    return () => {
      window.removeEventListener('cart_updated', updateCounts);
      window.removeEventListener('wishlist_updated', updateCounts);
    };
  }, []);

  useEffect(() => {
    const loadNotifs = () => {
      const stored = JSON.parse(localStorage.getItem('agrinova_notifications') || '[]');
      setNotifications(stored);
      setUnreadCount(stored.filter(n => n.unread).length);
    };
    loadNotifs();
    window.addEventListener('notifications_updated', loadNotifs);
    return () => window.removeEventListener('notifications_updated', loadNotifs);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    localStorage.removeItem('agrinova_cart');
    localStorage.removeItem('agrinova_wishlist');
    navigate('/login');
  };

  const userInitials = user 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() 
    : 'BY';

  // Central Navigation Links
  const menuItems = [
    { name: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
    { name: 'Marketplace', path: 'marketplace', icon: ShoppingBag },
    { name: 'My Orders', path: 'orders', icon: ClipboardList },
    { name: 'Suppliers', path: 'suppliers', icon: Users },
    { name: 'Weather', path: 'weather', icon: CloudSun },
    { name: 'Messages', path: 'messages', icon: MessageSquare }
  ];

  // Auto close mobile drawer on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAF5]/85 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-charcoal dark:text-gray-100">
                Agri<span className="text-primary font-extrabold">Nova</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className="text-sm font-semibold text-charcoal dark:text-gray-100/70 hover:text-primary transition-colors relative flex items-center gap-1.5 group focus:outline-none py-2"
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-charcoal dark:text-gray-100/40 group-hover:text-primary transition-colors'}`} />
                    <span className={isActive ? 'text-primary font-bold' : ''}>{item.name}</span>
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 rounded-full ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Utilities Section */}
          <div ref={navDropdownRef} className="flex items-center gap-1 sm:gap-2.5 ml-auto lg:ml-0 shrink-0">
            
            <LanguageSelector />
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link
              to="wishlist"
              className="p-2 rounded-xl hover:bg-primary/5 text-charcoal dark:text-gray-100/60 hover:text-primary relative transition-colors focus:outline-none"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute top-1.5 right-1.5 px-1 py-0.25 rounded-full bg-primary text-white text-[9px] font-bold min-w-[14px] text-center ring-2 ring-[#F8FAF5] dark:ring-[#0F172A]">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="cart"
              className="p-2 rounded-xl hover:bg-primary/5 text-charcoal dark:text-gray-100/60 hover:text-primary relative transition-colors focus:outline-none"
              title="Escrow Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 px-1 py-0.25 rounded-full bg-secondary text-white text-[9px] font-bold min-w-[14px] text-center ring-2 ring-[#F8FAF5] dark:ring-[#0F172A]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                className="p-2 rounded-xl hover:bg-primary/5 text-charcoal dark:text-gray-100/60 hover:text-primary relative transition-colors cursor-pointer focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#F8FAF5] dark:ring-[#0F172A]" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xl py-3 z-40"
                    >
                      <div className="px-4 pb-2 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-charcoal dark:text-gray-100">Recent Notifications</span>
                        <Link to="notifications" className="text-xs font-bold text-primary hover:underline">View All</Link>
                      </div>
                      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-60 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 4).map(notif => (
                            <div key={notif.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-[#0F172A] transition-colors ${notif.unread ? 'bg-primary/5' : ''}`}>
                              <h4 className="text-sm font-bold text-charcoal dark:text-gray-100">{notif.title}</h4>
                              <p className="text-xs text-gray-400 mt-0.5 font-medium leading-normal">{notif.message}</p>
                              <span className="text-[10px] text-gray-400 font-semibold block mt-1">{notif.time}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400 font-semibold">
                            No notifications yet.
                          </div>
                        )}
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-primary/5 transition-colors cursor-pointer focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display font-extrabold text-sm shadow-md shadow-primary/10 shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left leading-none pr-1">
                  <p className="text-sm font-bold text-charcoal dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs font-bold text-primary mt-0.5 uppercase tracking-wider">Buyer</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-40"
                    >
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 text-left">
                        <p className="text-sm font-bold text-charcoal dark:text-gray-100 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-400 font-bold truncate mt-0.5 uppercase">{user?.companyName || 'Verified Corporate'}</p>
                      </div>
                      
                      <Link
                        to="profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary font-semibold transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Corporate Profile</span>
                      </Link>
                      
                      <Link
                        to="settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary font-semibold transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="help"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary font-semibold transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Help & Support</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold border-t border-gray-50 dark:border-gray-800 text-left cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-charcoal dark:text-gray-100/60 hover:bg-primary/5 hover:text-primary transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-charcoal dark:text-gray-100 hover:bg-primary/5 hover:text-primary'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
