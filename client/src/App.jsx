import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword';
import ChatbotWidget from './components/ChatbotWidget';
import ScrollToTop from './components/ScrollToTop';

// Farmer Dashboard Imports
import FarmerLayout from './farmer/layouts/FarmerLayout'
import Dashboard from './farmer/pages/Dashboard'
import Profile from './farmer/pages/Profile'
import EditProfile from './farmer/pages/EditProfile'
import Products from './farmer/pages/Products'
import AddProduct from './farmer/pages/AddProduct'
import EditProduct from './farmer/pages/EditProduct'
import Orders from './farmer/pages/Orders'
import OrderDetails from './farmer/pages/OrderDetails'
import Buyers from './farmer/pages/Buyers'
import Weather from './farmer/pages/Weather'
import Messages from './farmer/pages/Messages'
import Notifications from './farmer/pages/Notifications'
import Settings from './farmer/pages/Settings'
import HelpSupport from './farmer/pages/HelpSupport'

// Buyer Dashboard Imports
import BuyerLayout from './buyer/layouts/BuyerLayout'
import BuyerDashboard from './buyer/pages/Dashboard'
import Marketplace from './buyer/pages/Marketplace'
import ProductDetails from './buyer/pages/ProductDetails'
import Cart from './buyer/pages/Cart'
import Wishlist from './buyer/pages/Wishlist'
import MyOrders from './buyer/pages/MyOrders'
import BuyerOrderDetails from './buyer/pages/OrderDetails'
import BuyerBids from './buyer/pages/BuyerBids'
import BuyerMessages from './buyer/pages/Messages'
import Suppliers from './buyer/pages/Suppliers'
import SupplierProfile from './buyer/pages/SupplierProfile'
import BuyerNotifications from './buyer/pages/Notifications'
import BuyerWeather from './buyer/pages/Weather'
import BuyerProfile from './buyer/pages/Profile'
import BuyerEditProfile from './buyer/pages/EditProfile'
import BuyerSettings from './buyer/pages/Settings'
import BuyerHelpSupport from './buyer/pages/HelpSupport'

// Admin Dashboard Imports
import AdminLayout from './admin/layouts/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import AdminFarmersManagement from './admin/pages/FarmersManagement'
import AdminFarmerDetails from './admin/pages/FarmerDetails'
import AdminBuyersManagement from './admin/pages/BuyersManagement'
import AdminBuyerDetails from './admin/pages/BuyerDetails'
import AdminProductsManagement from './admin/pages/ProductsManagement'
import AdminProductDetails from './admin/pages/ProductDetails'
import AdminOrdersManagement from './admin/pages/OrdersManagement'
import AdminOrderDetails from './admin/pages/OrderDetails'
import AdminBidsManagement from './admin/pages/BidsManagement'
import AdminMessagesMonitoring from './admin/pages/MessagesMonitoring'
import AdminWeatherManagement from './admin/pages/WeatherManagement'
import AdminCategoriesManagement from './admin/pages/CategoriesManagement'
import AdminPaymentsManagement from './admin/pages/PaymentsManagement'
import AdminTransactions from './admin/pages/Transactions'
import AdminNotificationsManagement from './admin/pages/NotificationsManagement'

import AdminSupportTickets from './admin/pages/SupportTickets'
import AdminReviewsRatings from './admin/pages/ReviewsRatings'
import AdminVerificationRequests from './admin/pages/VerificationRequests'
import AdminProfile from './admin/pages/Profile'
import AdminSettings from './admin/pages/Settings'
import AdminNewsletters from './admin/pages/NewslettersManagement'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Farmer Routes */}
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="buyers" element={<Buyers />} />
            <Route path="weather" element={<Weather />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>

          {/* Protected Buyer Routes */}
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<BuyerOrderDetails />} />
            <Route path="bids" element={<BuyerBids />} />
            <Route path="messages" element={<BuyerMessages />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/:id" element={<SupplierProfile />} />
            <Route path="notifications" element={<BuyerNotifications />} />
            <Route path="weather" element={<BuyerWeather />} />
            <Route path="profile" element={<BuyerProfile />} />
            <Route path="profile/edit" element={<BuyerEditProfile />} />
            <Route path="settings" element={<BuyerSettings />} />
            <Route path="help" element={<BuyerHelpSupport />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="farmers" element={<AdminFarmersManagement />} />
            <Route path="farmers/:id" element={<AdminFarmerDetails />} />
            <Route path="buyers" element={<AdminBuyersManagement />} />
            <Route path="buyers/:id" element={<AdminBuyerDetails />} />
            <Route path="products" element={<AdminProductsManagement />} />
            <Route path="products/:id" element={<AdminProductDetails />} />
            <Route path="orders" element={<AdminOrdersManagement />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="bids" element={<AdminBidsManagement />} />
            <Route path="messages" element={<AdminMessagesMonitoring />} />
            <Route path="weather" element={<AdminWeatherManagement />} />
            <Route path="categories" element={<AdminCategoriesManagement />} />
            <Route path="payments" element={<AdminPaymentsManagement />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="notifications" element={<AdminNotificationsManagement />} />
            <Route path="support" element={<AdminSupportTickets />} />
            <Route path="reviews" element={<AdminReviewsRatings />} />
            <Route path="verifications" element={<AdminVerificationRequests />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatbotWidget />
        
        {/* <ScrollToTop /> */}
      </BrowserRouter>
    </LanguageProvider>
  </ThemeProvider>
  )
}

export default App
