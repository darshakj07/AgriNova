import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BuyerNavbar from '../components/BuyerNavbar';
import Footer from '../../components/Footer';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BuyerLayout() {
  const location = useLocation();
  const token = localStorage.getItem('agrinova_token');
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem('agrinova_user');
    return userString ? JSON.parse(userString) : null;
  });

  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem('agrinova_user', JSON.stringify(newUser));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: {
            'x-user-id': user?.id
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          updateUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching profile from database", error);
      }
    };
    if (token && user?.id) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(API_BASE);

    socket.on('orderUpdated', async (data) => {
      if (!data || !data.orderId) return;

      try {
        const response = await fetch(`${API_BASE}/api/orders/${data.orderId}`, {
          headers: {
            'x-user-id': user.id || user._id
          }
        });
        const orderData = await response.json();
        if (response.ok && orderData.success) {
          const order = orderData.order;

          // Check if this order relates to this user
          const isBuyer = order.buyerId?.toString() === user.id || order.buyerId?.toString() === user._id;

          if (isBuyer) {
            const timeStr = new Date().toLocaleString('en-US', { 
              month: 'short', 
              day: '2-digit',
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            });
            const title = `Order #${order.id} is now ${order.status}`;
            let message = '';
            if (order.status === 'Pending') {
              message = `Your order for ${order.product.qty} of ${order.product.name} has been placed successfully and escrow holds ₹${order.product.total.toLocaleString()}.`;
            } else {
              message = `Farmer ${order.farmer} updated Order #${order.id} status to: ${order.status}.`;
            }

            // Save in localStorage
            const localNotifs = JSON.parse(localStorage.getItem('agrinova_notifications') || '[]');
            const newNotif = {
              id: Date.now() + Math.random().toString(),
              type: order.status === 'Pending' ? 'System' : 'Shipping',
              category: 'Order Update',
              time: timeStr,
              title,
              message,
              unread: true
            };

            const updatedNotifs = [newNotif, ...localNotifs].slice(0, 25);
            localStorage.setItem('agrinova_notifications', JSON.stringify(updatedNotifs));

            // Dispatch event
            window.dispatchEvent(new Event('notifications_updated'));
          }
        }
      } catch (err) {
        console.error('Error handling socket order notification:', err);
      }
    });

    socket.on('announcementBroadcast', (data) => {
      if (!data) return;
      const isTarget = data.target === 'All Users' || data.target === 'Buyers Only';
      if (isTarget) {
        const timeStr = new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: '2-digit',
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        });
        const localNotifs = JSON.parse(localStorage.getItem('agrinova_notifications') || '[]');
        const newNotif = {
          id: Date.now() + Math.random().toString(),
          type: 'alert',
          category: 'System Alert',
          time: timeStr,
          title: data.title,
          message: data.message,
          unread: true
        };
        const updatedNotifs = [newNotif, ...localNotifs].slice(0, 25);
        localStorage.setItem('agrinova_notifications', JSON.stringify(updatedNotifs));
        window.dispatchEvent(new Event('notifications_updated'));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Protect route: Redirect to login if token is missing or if not a buyer
  if (!token || !user || user.role !== 'buyer') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-bg-base text-charcoal dark:text-gray-100 font-sans flex flex-col justify-between">
      
      <div className="flex flex-col flex-1">
        {/* Top sticky navbar */}
        <BuyerNavbar user={user} />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pb-16 w-full"
            >
              <Outlet context={{ user, updateUser }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}

