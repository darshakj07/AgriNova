import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  X, LayoutDashboard, BarChart3, Users, UserCheck, Sprout, 
  ClipboardList, Gavel, ShieldAlert, CreditCard, CheckSquare, 
  MessageSquare, HelpCircle, Star, FolderTree, CloudSun, Bell, 
  User, Settings, LogOut, ShoppingBag, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar({ user, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    navigate('/login');
  };

  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/tickets`, {
          headers: { 'x-user-id': user.id || user._id }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const openCount = data.tickets.filter(t => t.status === 'Open').length;
          setOpenTicketsCount(openCount);
        }
      } catch (err) {
        console.error('Error fetching tickets for sidebar:', err);
      }
    };
    fetchTickets();
    
    // Set up a simple interval to poll for updates every minute, or listen to an event
    const intervalId = setInterval(fetchTickets, 60000);
    return () => clearInterval(intervalId);
  }, [user]);

  const sections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: 'dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Directories',
      items: [
        { name: 'Farmers Management', path: 'farmers', icon: Users },
        { name: 'Buyers Management', path: 'buyers', icon: UserCheck }
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Products Management', path: 'products', icon: Sprout },
        { name: 'Orders Management', path: 'orders', icon: ClipboardList, badge: '4 New' },
        { name: 'Bids Management', path: 'bids', icon: Gavel }
      ]
    },
    {
      title: 'Finance & Escrow',
      items: [
        { name: 'Payments Management', path: 'payments', icon: ShieldAlert },
        { name: 'Transactions Audit', path: 'transactions', icon: CreditCard }
      ]
    },
    {
      title: 'Platform Moderation',
      items: [
        // { name: 'Verification Requests', path: 'verifications', icon: CheckSquare, badge: '3 Pending', badgeColor: 'bg-amber-500 text-white' },
        { name: 'Verification Requests', path: 'verifications', icon: CheckSquare, badgeColor: 'bg-amber-500 text-white' },
        // { name: 'Messages Monitoring', path: 'messages', icon: MessageSquare, label: 'Flagged' },
        { name: 'Messages Monitoring', path: 'messages', icon: MessageSquare },
        { name: 'Support Tickets', path: 'support', icon: HelpCircle, badge: openTicketsCount > 0 ? `${openTicketsCount} Open` : null, badgeColor: 'bg-red-500 text-white' },
        { name: 'Reviews & Ratings', path: 'reviews', icon: Star }
      ]
    },
    {
      title: 'System Settings',
      items: [
        { name: 'Categories Management', path: 'categories', icon: FolderTree },
        { name: 'Weather Telemetries', path: 'weather', icon: CloudSun },
        { name: 'Newsletters', path: 'newsletters', icon: Mail },
        { name: 'Notifications Dispatch', path: 'notifications', icon: Bell }
      ]
    },
    {
      title: 'Account Settings',
      items: [
        { name: 'Admin Profile', path: 'profile', icon: User },
        { name: 'System Settings', path: 'settings', icon: Settings }
      ]
    }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-[#1E293B] py-4 px-4 overflow-y-auto border-r border-primary/10">
      <div className="space-y-6">
        
        {/* Sidebar Header Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-55/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <ShoppingBag className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-charcoal dark:text-gray-100">
              Agri<span className="text-primary font-extrabold">Nova</span> <span className="text-xs bg-primary/5 text-primary border border-primary/10 px-1 py-0.25 rounded-md font-bold uppercase ml-1">Admin</span>
            </span>
          </div>
          
          {/* Close button on mobile */}
          <button onClick={onClose} className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary md:hidden focus:outline-none">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Grouped Sidebar Items */}
        <nav className="space-y-5">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-xs font-extrabold text-gray-450 uppercase tracking-widest block pl-3">
                {sec.title}
              </span>
              <div className="space-y-0.75">
                {sec.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all group focus:outline-none
                      ${isActive 
                        ? 'bg-primary text-white shadow-sm shadow-primary/10 font-bold' 
                        : 'text-charcoal dark:text-gray-100/70 hover:bg-primary/5 dark:hover:bg-slate-800 hover:text-primary'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-charcoal dark:text-gray-100/35 group-hover:text-primary transition-colors'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.badgeColor || 'bg-primary/5 text-primary border border-primary/10'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.label && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-gray-50 mt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left focus:outline-none"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out System</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 lg:w-72 h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-40 md:hidden" onClick={onClose} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

