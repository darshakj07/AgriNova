import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  ArrowLeft, ShieldCheck, MapPin, Truck, ShoppingCart, Plus, Minus, 
  MessageSquare, Loader2, Wheat, Carrot, Droplet, Sprout, Star, 
  CheckCircle2, Building, Calendar, BadgeCheck, TrendingUp, Info, 
  X, AlertCircle, ThumbsUp, CreditCard, Lock, RefreshCw, FileText, ChevronRight, Award, Check
} from 'lucide-react';

// Premium Agricultural Unsplash images for rich fallback galleries
const CROP_IMAGES = {
  Grains: [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1444858291040-58fe75488333?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1501430654243-c934ccd2e1c0?auto=format&fit=crop&q=80&w=800'
  ],
  Vegetables: [
    'https://images.unsplash.com/photo-1518977676601-b53f02bc6834?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&q=80&w=800'
  ],
  Oilseeds: [
    'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&q=80&w=800'
  ],
  Default: [
    'https://images.unsplash.com/photo-1500937386664-56d159f87b81?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1625246140679-b7c9879077f8?auto=format&fit=crop&q=80&w=800'
  ]
};

// Rich details of similar crops for the catalog footer
const SIMILAR_CROPS_DATA = [
  { id: 'sim-1', name: 'Amber Durum Wheat', category: 'Grains', price: 2750, quantity: 300, farmerName: 'Vijay Mandloi', location: 'Dhar, MP', rating: 4.8, image: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=400' },
  { id: 'sim-2', name: 'Premium Red Potatoes', category: 'Vegetables', price: 1600, quantity: 150, farmerName: 'Suresh Patil', location: 'Indore, MP', rating: 4.6, image: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&q=80&w=400' },
  { id: 'sim-3', name: 'Black Mustard Seeds', category: 'Oilseeds', price: 5850, quantity: 200, farmerName: 'Karan Choudhary', location: 'Ujjain, MP', rating: 4.9, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400' },
  { id: 'sim-4', name: 'Hybrid Maize / Corn', category: 'Grains', price: 1850, quantity: 500, farmerName: 'Dinesh Yadav', location: 'Dewas, MP', rating: 4.5, image: 'https://images.unsplash.com/photo-1551754625-70582497bd3f?auto=format&fit=crop&q=80&w=400' }
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // State flags & crop particulars
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('0.0');

  // Interactive purchase states: 'details' | 'checkout' | 'payment' | 'tracking'
  const [purchaseState, setPurchaseState] = useState('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeInfoTab, setActiveInfoTab] = useState('specs');
  
  // Negotiation panel drawer state
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [offerQty, setOfferQty] = useState(10);
  const [offerRate, setOfferRate] = useState(0);
  
  // Checkout & Order data states
  const [selectedQty, setSelectedQty] = useState(10);
  const [shippingAddress, setShippingAddress] = useState('Plot 42, B2B Industrial Mandi Sector, Indore, MP - 452001');
  const [billingCompany, setBillingCompany] = useState('Indore Wholesale Foods Pvt. Ltd.');
  const [logisticsProvider, setLogisticsProvider] = useState('agrinova'); // 'agrinova' | 'mandi' | 'self'
  const [activeOrder, setActiveOrder] = useState(null);
  
  // Simulated tracking status
  // 'Pending' | 'Accepted' | 'Processing' | 'Ready For Dispatch' | 'Shipped' | 'Delivered' | 'Cancelled'
  const [simulatedStatus, setSimulatedStatus] = useState('Pending');

  const socketRef = useRef(null);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        headers: {
          'x-user-id': user.id || user._id
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setActiveOrder(data.order);
        
        // map order status to simulated tracking status
        const mapping = {
          'Pending': 'Pending',
          'Quality Checking': 'Processing',
          'Processing': 'Processing',
          'In Transit': 'Shipped',
          'Shipped': 'Shipped',
          'Ready For Dispatch': 'Ready For Dispatch',
          'Completed': 'Delivered',
          'Delivered': 'Delivered',
          'Cancelled': 'Cancelled'
        };
        setSimulatedStatus(mapping[data.order.status] || data.order.status);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  useEffect(() => {
    socketRef.current = io(API_BASE);

    socketRef.current.on('stockUpdated', (data) => {
      if (data && crop && data.productId === crop._id) {
        console.log('[Socket] Stock updated in real-time:', data);
        setCrop(prev => prev ? { ...prev, quantity: data.newQuantity } : null);
      }
    });

    socketRef.current.on('orderUpdated', (data) => {
      if (data && activeOrder && data.orderId === activeOrder.id) {
        console.log('[Socket] Active order updated in real-time:', data);
        fetchOrderDetails(data.orderId);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [crop?._id, activeOrder?.id]);

  useEffect(() => {
    if (user) {
      if (user.companyName) {
        setBillingCompany(user.companyName);
      }
      if (user.city) {
        setShippingAddress(`${user.city}, Business: ${user.companyName || 'Corporate Buyer'}, Phone: ${user.phone || ''}`);
      }
    }
  }, [user]);

  // Fetch product from backend API and enhance it with premium mockup data if missing parameters
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      let p = null;
      // If it looks like a database ObjectId (24 chars hex), try API fetch first
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isObjectId) {
        try {
          const response = await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id
            }
          });
          const data = await response.json();
          if (response.ok && data.product) {
            p = data.product;
          }
        } catch (e) {
          console.warn("API Fetch failed, checking local mocks", e);
        }
      }

      // If API did not yield a product or it's a mock ID, use a rich local template
      if (!p) {
        const titleMap = {
          'organic-potatoes': { name: 'Organic Potatoes', category: 'Vegetables', price: 1350, qty: 180, farmer: 'Devendra Patil' },
          'sharbati-wheat': { name: 'Sharbati Wheat', category: 'Grains', price: 2650, qty: 250, farmer: 'Harish Sharma' },
          'yellow-soybean': { name: 'Yellow Soybean', category: 'Oilseeds', price: 4850, qty: 400, farmer: 'Rajesh Mishra' }
        };

        const details = titleMap[id] || { name: 'Verified Sharbati Wheat', category: 'Grains', price: 2650, qty: 250, farmer: 'Devendra Patil' };
        
        p = {
          _id: id || 'sharbati-wheat',
          name: details.name,
          category: details.category,
          price: details.price,
          quantity: details.qty,
          description: `Premium export-quality ${details.name.toLowerCase()} cultivated in nitrogen-rich soil under expert agronomy supervision. Freshly harvested and cold-stored in advanced atmospheric warehousing. Free from external dirt, weed seeds, or contamination. High nutritive profile and lab-verified moisture ratio.`,
          createdAt: new Date().toISOString(),
          farmerId: {
            _id: 'farm-dev-992',
            firstName: details.farmer.split(' ')[0],
            lastName: details.farmer.split(' ')[1] || '',
            farmName: `${details.farmer.split(' ')[0]}'s Agri Holdings`,
            farmLocation: 'Sehore, Madhya Pradesh',
            farmSize: '45 Acres',
            completedOrders: 142,
            rating: 4.8,
            deliveryRegions: ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi NCR']
          }
        };
      }

      // Enrich product parameters to fit our high-fidelity premium mock template
      const categoryImages = CROP_IMAGES[p.category] || CROP_IMAGES.Default;
      if (!p.images || p.images.length === 0) {
        p.images = categoryImages;
      }
      
      // Moisture content determination
      if (!p.moistureContent) {
        p.moistureContent = p.category === 'Grains' ? '11.5%' : p.category === 'Vegetables' ? '14.2%' : '8.5%';
      }
      
      // Salinity
      if (!p.salinity) p.salinity = '1.2 dS/m';
      
      // Soil NPK
      if (!p.npkRatio) p.npkRatio = '120:60:60 Ratio';
      
      // Farmer info structure safety & enrichment
      let fId = p.farmerId;
      if (!fId) {
        fId = {};
      } else if (typeof fId === 'string') {
        fId = { _id: fId };
      }

      p.farmerId = {
        _id: fId._id || 'farmer-101',
        firstName: fId.firstName || 'Devendra',
        lastName: fId.lastName || 'Patil',
        farmName: fId.farmName || `${fId.firstName || 'Devendra'}'s Agricultural Farm`,
        farmLocation: fId.farmLocation || 'Sehore, Madhya Pradesh',
        farmSize: fId.farmSize || '38 Acres',
        completedOrders: fId.completedOrders || 142,
        rating: fId.rating || 4.8,
        deliveryRegions: fId.deliveryRegions || ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Delhi NCR']
      };
      
      // Certified & pesticide residues
      p.organicCertified = p.name.toLowerCase().includes('organic') || p.category === 'Vegetables';
      p.pesticideLevel = p.organicCertified ? 'Non-detectable (0.01 ppm limit)' : 'Safe limits (Lab Certified)';
      p.variety = p.category === 'Grains' ? 'Grade A Sharbati' : p.category === 'Vegetables' ? 'Kufri Jyoti' : 'JS-9560 Yellow';
      
      setCrop(p);
      setOfferRate(p.price - 100);
      setOfferQty(p.quantity > 50 ? 50 : p.quantity);
      setSelectedQty(p.quantity > 20 ? 20 : p.quantity);

      // Fetch real reviews for the farmer
      if (p.farmerId && p.farmerId._id) {
        fetchFarmerReviews(p.farmerId._id);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while connecting to the database');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmerReviews = async (farmerId) => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/user/${farmerId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.reviews);
        setAverageRating(data.avgRating);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    if (user?.id && id) {
      fetchProduct();
      // Reset flow if route ID changes
      setPurchaseState('details');
      setSimulatedStatus('Pending');
      setActiveOrder(null);
    }
  }, [user?.id, id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('agrinova_cart') || '[]');
    const exists = cart.some(item => (item.id === crop._id || item._id === crop._id));
    if (!exists) {
      const updated = [...cart, { ...crop, id: crop._id, quantitySelected: selectedQty }];
      localStorage.setItem('agrinova_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart_updated'));
      alert(`Success! ${crop.name} added to your escrow cart.`);
    } else {
      alert(`${crop.name} is already in your cart.`);
    }
  };

  // Triggering the Order Workflow
  const startPurchaseFlow = () => {
    setPurchaseState('checkout');
  };

  const submitCheckout = (e) => {
    e.preventDefault();
    if (selectedQty <= 0) {
      alert("Please specify a valid quantity for purchase.");
      return;
    }
    setPurchaseState('payment');
  };

  const completePayment = async () => {
    // Auto-calculate billing costs
    const cropTotal = crop.price * selectedQty;
    let transportFee = 0;
    if (logisticsProvider === 'agrinova') transportFee = 150 * selectedQty;
    else if (logisticsProvider === 'mandi') transportFee = 80 * selectedQty;
    
    const escrowFee = Math.round(cropTotal * 0.01);
    const tax = Math.round(cropTotal * 0.05); // 5% B2B Agriculture cess/GST
    const grandTotal = cropTotal + transportFee + escrowFee + tax;

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      buyer: {
        name: billingCompany,
        manager: user.firstName ? `${user.firstName} ${user.lastName}` : 'Buyer Manager',
        phone: user.phone || '+91 99887 76655',
        address: shippingAddress
      },
      product: {
        id: crop._id,
        name: crop.name,
        category: crop.category,
        qty: `${selectedQty} Quintals`,
        rate: `₹${crop.price}/qtl`,
        total: `₹${grandTotal.toLocaleString()}`
      },
      payment: {
        status: 'Held in Escrow',
        method: 'AgriNova Escrow Direct',
        transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`
      },
      farmer: `${crop.farmerId.firstName || ''} ${crop.farmerId.lastName || ''}`.trim() || 'AgriNova Farmer',
      status: 'Pending'
    };

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Failed to place order.');
        return;
      }

      // Set active order from backend
      const createdOrder = data.orders[0];
      setActiveOrder(createdOrder);
      setSimulatedStatus('Pending');
      setPurchaseState('tracking');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Error placing order: ' + err.message);
    }
  };

  // Submit Negotiated Offer
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (offerQty <= 0 || offerRate <= 0) {
      alert("Invalid offer rates or quantities.");
      return;
    }

    const offerId = `BID-${Math.floor(10000 + Math.random() * 90000)}`;
    const mockBid = {
      id: offerId,
      cropId: crop._id,
      cropName: crop.name,
      farmer: `${crop.farmerId.firstName || ''} ${crop.farmerId.lastName || ''}`.trim() || 'AgriNova Farmer',
      qty: `${offerQty} qtl`,
      bidRate: `₹${offerRate}/qtl`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    const bids = JSON.parse(localStorage.getItem('agrinova_bids') || '[]');
    localStorage.setItem('agrinova_bids', JSON.stringify([mockBid, ...bids]));
    
    setShowOfferPanel(false);
    
    const negotiatedOrder = {
      id: offerId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      buyer: {
        name: billingCompany,
        manager: user.firstName ? `${user.firstName} ${user.lastName}` : 'Buyer Manager',
        phone: user.phone || '+91 99887 76655',
        address: shippingAddress
      },
      product: {
        id: crop._id,
        name: crop.name,
        category: crop.category,
        qty: `${offerQty} Quintals`,
        rate: `₹${offerRate}/qtl`,
        total: `₹${(offerQty * offerRate).toLocaleString()}`
      },
      payment: {
        status: 'Negotiation Active',
        method: 'AgriNova Escrow Direct',
        transactionId: 'N/A - Awaiting Bid Acceptance'
      },
      farmer: `${crop.farmerId.firstName || ''} ${crop.farmerId.lastName || ''}`.trim() || 'AgriNova Farmer',
      status: 'Pending'
    };
    
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify(negotiatedOrder)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || 'Failed to submit offer.');
        return;
      }
      setActiveOrder(data.orders[0]);
      setSimulatedStatus('Pending');
      setPurchaseState('tracking');
      alert(`Success! Bid proposal of ₹${offerRate}/qtl for ${offerQty} quintals has been submitted to ${crop.farmerId.firstName}. You have been redirected to the tracking page.`);
    } catch (err) {
      console.error('Error submitting offer:', err);
      alert('Error submitting offer: ' + err.message);
    }
  };

  // Simulating Farmer Status updates
  const advanceSimulatedStatus = async (nextStatus) => {
    if (!activeOrder) return;

    let paymentStatus = activeOrder.payment?.status || 'Held in Escrow';
    if (nextStatus === 'Delivered') paymentStatus = 'Released to Farmer';
    else if (nextStatus === 'Cancelled') paymentStatus = 'Refunded to Buyer';

    try {
      const response = await fetch(`${API_BASE}/api/orders/${activeOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id || user._id
        },
        body: JSON.stringify({
          status: nextStatus,
          paymentStatus: paymentStatus
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setActiveOrder(data.order);
        setSimulatedStatus(nextStatus);
      } else {
        console.error('Failed to update simulated status:', data.message);
      }
    } catch (err) {
      console.error('Error updating simulated status:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Grains': return <Wheat className="w-5 h-5 text-amber-500" />;
      case 'Vegetables': return <Carrot className="w-5 h-5 text-orange-500" />;
      case 'Oilseeds': return <Droplet className="w-5 h-5 text-yellow-600" />;
      default: return <Sprout className="w-5 h-5 text-green-500" />;
    }
  };

  // Calculated costs for summary sidebar
  const calculatedCropTotal = crop ? crop.price * selectedQty : 0;
  const calculatedEscrowFee = crop ? Math.round(calculatedCropTotal * 0.01) : 0;
  const calculatedTax = crop ? Math.round(calculatedCropTotal * 0.05) : 0;
  let calculatedTransport = 0;
  if (logisticsProvider === 'agrinova') calculatedTransport = selectedQty * 150;
  else if (logisticsProvider === 'mandi') calculatedTransport = selectedQty * 80;
  const calculatedGrandTotal = calculatedCropTotal + calculatedEscrowFee + calculatedTax + calculatedTransport;

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-base text-gray-500 dark:text-gray-400 font-bold tracking-wide">Synchronizing AgriNova Quality Telemetry...</p>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('../marketplace')} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/20 text-charcoal dark:text-gray-100/65 hover:text-primary transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">Crop specifications missing</h2>
        </div>
        <div className="bg-red-50 rounded-3xl border border-red-100 p-8 text-center text-red-800 font-semibold shadow-xs">
          ⚠️ {error || 'The requested crop could not be found.'}
        </div>
      </div>
    );
  }

  const farmerName = `${crop.farmerId.firstName} ${crop.farmerId.lastName}`;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              if (purchaseState !== 'details') {
                setPurchaseState('details');
              } else {
                navigate('../marketplace');
              }
            }}
            className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-charcoal/5 dark:border-white/5 shadow-xs hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100 tracking-tight">
              {purchaseState === 'details' && "Product Specification"}
              {purchaseState === 'checkout' && "Commercial Order Checkout"}
              {purchaseState === 'payment' && "Secure Escrow Payment Gate"}
              {purchaseState === 'tracking' && "Order Fulfillment Dashboard"}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {purchaseState === 'details' && "Inspect verified crop telemetry parameters and negotiate direct deals."}
              {purchaseState === 'checkout' && "Specify your delivery logistics, billing and business address."}
              {purchaseState === 'payment' && "Lock wholesale payment safely in trust escrow."}
              {purchaseState === 'tracking' && "Track logistics pipeline, lab check statuses, and grower fulfillment logs."}
            </p>
          </div>
        </div>
        
        {/* Active Flow Badge indicator */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B]/70 border border-charcoal/5 dark:border-white/5 px-4 py-2 rounded-2xl self-start md:self-auto shadow-xs">
          <span className={`w-2 h-2 rounded-full ${purchaseState === 'tracking' ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-display">
            {purchaseState === 'details' && "Step 1: Product Specifications"}
            {purchaseState === 'checkout' && "Step 2: Logistics & Checkout"}
            {purchaseState === 'payment' && "Step 3: Escrow Payment Lock"}
            {purchaseState === 'tracking' && "Step 4: Logistics Tracking"}
          </span>
        </div>
      </div>

      {/* WORKFLOW VIEW CONTROLLERS */}
      <AnimatePresence mode="wait">
        {purchaseState === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* LEFT SIDE: GALLERY, MAIN SPECS, INTERACTIVE TABS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Image Gallery and Primary Highlights */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                
                {/* Images Container */}
                <div className="relative">
                  <div className="w-full h-80 sm:h-[450px] rounded-3xl overflow-hidden bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 shadow-inner relative flex items-center justify-center">
                    <img 
                      src={typeof crop.images[activeImageIndex] === 'object' ? (crop.images[activeImageIndex]?.secure_url || crop.images[activeImageIndex]?.url) : crop.images[activeImageIndex]} 
                      alt={`${crop.name} detail view`} 
                      className="w-full h-full object-cover transition-all duration-300 transform scale-100 group-hover:scale-102"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-xs border border-white/20">
                      Quality Verified
                    </div>
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full">
                      {activeImageIndex + 1} / {crop.images.length}
                    </div>
                  </div>

                  {/* Thumbnail bar */}
                  <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar py-1">
                    {crop.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-24 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-primary ring-2 ring-primary/20 scale-102 shadow-xs'
                            : 'border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={typeof img === 'object' ? (img?.secure_url || img?.url) : img} alt="crop thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Description Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-extrabold uppercase tracking-widest border border-primary/10 flex items-center gap-1">
                        {getCategoryIcon(crop.category)}
                        {crop.category}
                      </span>
                      {crop.organicCertified && (
                        <span className="px-3 py-1 rounded-full bg-secondary/5 text-secondary text-[10px] font-extrabold uppercase tracking-widest border border-secondary/15 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-secondary" />
                          100% Organic
                        </span>
                      )}
                    </div>
                    <h1 className="font-display font-extrabold text-3xl text-charcoal dark:text-gray-100 tracking-tight">{crop.name}</h1>
                    
                    {/* Location coordinates link */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      <MapPin className="w-4.5 h-4.5 text-gray-300" />
                      <span>Farm Origin:</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crop.farmerId.farmLocation)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold flex items-center gap-0.5"
                      >
                        {crop.farmerId.farmLocation}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Mandi Rate Box */}
                  <div className="bg-gradient-to-tr from-[#2E7D32]/5 to-[#66BB6A]/5 border border-primary/15 rounded-3xl p-5 min-w-[200px] text-center sm:text-right">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">Base wholesale price</span>
                    <div className="flex items-baseline justify-center sm:justify-end gap-1 mt-1">
                      <span className="font-display font-extrabold text-4xl text-charcoal dark:text-gray-100">₹{crop.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 font-bold uppercase">/qtl</span>
                    </div>
                    <span className="text-xs font-bold text-primary mt-1 block">Escrow Protected</span>
                  </div>
                </div>

                {/* Telemetry parameter grid */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 uppercase tracking-wider">Quality Telemetry Indicators</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-[#0F172A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Moisture Ratio</span>
                      <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 mt-1 block">{crop.moistureContent}</span>
                      <span className="text-[9px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1.5 inline-block">Safe Storage</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0F172A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Soil Salinity</span>
                      <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 mt-1 block">{crop.salinity}</span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1.5 inline-block">Lab Verified</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0F172A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Seed Variety</span>
                      <span className="font-display font-extrabold text-base text-charcoal dark:text-gray-100 mt-1.5 block truncate" title={crop.variety}>{crop.variety}</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">Certified Seed</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0F172A]/60 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Residues Check</span>
                      <span className="font-display font-bold text-xs text-charcoal dark:text-gray-100 mt-2 block truncate" title={crop.pesticideLevel}>{crop.pesticideLevel}</span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">QC Passed</span>
                    </div>
                  </div>
                </div>

                {/* Description Text */}
                <div className="space-y-2.5">
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 uppercase tracking-wider">Crop Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{crop.description}</p>
                </div>

              </div>

              {/* TABS SECTION: SPECS, LOGISTICS, REFUNDS, REVIEWS */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs overflow-hidden">
                
                {/* Tabs bar */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A]/60">
                  {[
                    { id: 'specs', label: 'Specifications', icon: <FileText className="w-4 h-4" /> },
                    { id: 'delivery', label: 'Delivery Terms', icon: <Truck className="w-4 h-4" /> },
                    { id: 'returns', label: 'Return Policy', icon: <RefreshCw className="w-4 h-4" /> },
                    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: <Star className="w-4 h-4" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveInfoTab(tab.id)}
                      className={`flex-1 py-4.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                        activeInfoTab === tab.id
                          ? 'border-primary text-primary bg-white dark:bg-[#1E293B] font-extrabold shadow-2xs'
                          : 'border-transparent text-gray-400 hover:text-charcoal dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab content panel */}
                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {activeInfoTab === 'specs' && (
                      <motion.div
                        key="specs"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4 text-sm font-semibold text-gray-500 dark:text-gray-400"
                      >
                        <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">Agricultural Spec Sheet</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>NPK Soil Ratio</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">{crop.npkRatio}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>Seed Variety Certified</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">{crop.variety}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>Storage Facility</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">Scientific Controlled Silo</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>Crop Health Code</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">AN-GR-{crop.category.slice(0, 3).toUpperCase()}-940</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>Organic Status</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">{crop.organicCertified ? '100% Certified Organic' : 'Conventional Crop'}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-50">
                            <span>Moisture Range Limit</span>
                            <span className="text-charcoal dark:text-gray-100 font-bold">Max 12.5% Allowed</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeInfoTab === 'delivery' && (
                      <motion.div
                        key="delivery"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold"
                      >
                        <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">Logistics & Freight Information</h4>
                        <p>AgriNova provides integrated B2B freight transportation in partner with leading Mandi Logistics firms. Secure transport routes are available across delivery states.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 space-y-2">
                            <span className="text-xs text-charcoal dark:text-gray-100 font-bold flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-primary" />
                              AgriNova Express Logistics
                            </span>
                            <p className="text-xs text-gray-400 font-medium">Temperature-controlled air-conditioned freight. Complete safety cargo insurance included. Delivery within 3-5 days. Rates: ₹150/qtl.</p>
                          </div>
                          
                          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 space-y-2">
                            <span className="text-xs text-charcoal dark:text-gray-100 font-bold flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-primary" />
                              Mandi Bulk Freight
                            </span>
                            <p className="text-xs text-gray-400 font-medium">Bulk flat-bed trucks. No temperature lock. Ideal for robust grains, oilseeds. Delivery within 5-7 days. Rates: ₹80/qtl.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeInfoTab === 'returns' && (
                      <motion.div
                        key="returns"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold"
                      >
                        <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">B2B Inspection & Rejection Terms</h4>
                        <p>We understand that quality is paramount for bulk commercial supply chains. AgriNova offers transparent protection terms for corporate buyers:</p>
                        <ul className="list-disc pl-5 space-y-2.5 text-xs text-gray-400 font-medium">
                          <li><strong>Mandi Gate QC Verification:</strong> Buyers are allowed to run laboratory moisture and foreign matter diagnostics upon cargo arrival.</li>
                          <li><strong>Full Gate Refusal:</strong> If moisture levels exceed 13.0% (for grains) or if damage/rot is found to exceed 2.0% by weight, you may refuse the shipment at the gate and trigger full escrow refund.</li>
                          <li><strong>Logistics Liability:</strong> Transit spoilage due to moisture ingress or truck leakage is covered under AgriNova Cargo Insurance.</li>
                        </ul>
                      </motion.div>
                    )}

                    {activeInfoTab === 'reviews' && (
                      <motion.div
                        key="reviews"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                          <div>
                            <h4 className="font-display font-bold text-charcoal dark:text-gray-100 text-base">Corporate Buyer Feedback</h4>
                            <p className="text-xs text-gray-400 font-medium">Ratings and testimonials from verified buyers who bought from this grower.</p>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-accent justify-end">
                              <Star className="w-5 h-5 fill-current" />
                              <span className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">{averageRating > 0 ? averageRating : '0.0'}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Average score</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {reviews.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-medium">No reviews yet.</div>
                          ) : reviews.map((rev) => (
                            <div key={rev._id || rev.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0F172A]/50 border border-gray-100 dark:border-gray-800 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-charcoal dark:text-gray-100 font-bold">{rev.reviewerId?.companyName || rev.reviewerId?.firstName || 'Buyer'}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-semibold block">{new Date(rev.createdAt || rev.date).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="flex gap-0.5 text-accent">
                                  {Array.from({ length: rev.rating }).map((_, i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{rev.review || rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>

            {/* RIGHT SIDE: FARMER INFORMATION & TRANSACTION ACTION CABINET */}
            <div className="space-y-6">
              
              {/* Farmers Information Card */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] flex items-start justify-end p-4">
                  <Award className="w-7 h-7 text-primary/30" />
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 uppercase tracking-wider">Cultivated By</h3>
                  <p className="text-xs text-gray-400 font-medium">Verified Mandi Grower Credentials.</p>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                  {/* Mock profile initials */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-sm relative">
                    {crop.farmerId?.firstName?.[0] || 'F'}
                    {crop.farmerId?.lastName?.[0] || ''}
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-[#1E293B] rounded-full shadow-2xs">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center text-white">
                        <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 leading-none">{farmerName}</h4>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">{crop.farmerId?.farmName || 'Grower Farm'}</span>
                    
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold text-charcoal dark:text-gray-100">{averageRating > 0 ? averageRating : 'N/A'}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">({crop.farmerId?.completedOrders || 142} orders)</span>
                    </div>
                  </div>
                </div>

                {/* Farmer specifications */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0F172A]/70 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Farm Size</span>
                    <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block">{crop.farmerId?.farmSize || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Farmer Status</span>
                    <span className="text-primary font-bold mt-0.5 block flex items-center gap-0.5">
                      <BadgeCheck className="w-3.5 h-3.5 fill-current" /> Gold Grower
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Logistics Delivery Regions</span>
                    <span className="text-charcoal dark:text-gray-100 font-bold mt-0.5 block truncate" title={crop.farmerId?.deliveryRegions?.join(', ') || 'N/A'}>
                      {crop.farmerId?.deliveryRegions?.join(', ') || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="../messages"
                    state={{
                      contactFarmerId: crop.farmerId._id,
                      contactFarmerName: farmerName,
                      contactCategory: crop.category,
                      contactLocation: crop.farmerId.farmLocation
                    }}
                    className="w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/20 text-gray-600 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs cursor-pointer bg-white dark:bg-[#1E293B]"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span>Contact Supplier</span>
                  </Link>
                </div>

              </div>

              {/* Transaction Purchase Cabinet */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 uppercase tracking-wider">Commercial Transaction</h3>
                  <p className="text-xs text-gray-400 font-medium">B2B wholesale purchase console.</p>
                </div>

                {/* Selected Qty details */}
                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span>Order Quantity</span>
                    <span className="text-charcoal dark:text-gray-100 font-bold">Max Avail: {crop.quantity} qtl</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedQty(q => q > 5 ? q - 5 : q)}
                      className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Minus className="w-4.5 h-4.5" />
                    </button>
                    
                    <div className="text-center">
                      <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 block">{selectedQty} Quintals</span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{(selectedQty * 100).toLocaleString()} Kilograms</span>
                    </div>

                    <button
                      onClick={() => setSelectedQty(q => q < crop.quantity ? q + 5 : q)}
                      className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Value Estimation */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#2E7D32]/5 to-transparent border border-primary/10 flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Estimated Crop Cost</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium block">Excl. taxes & freight</span>
                  </div>
                  <span className="font-display font-extrabold text-2xl text-charcoal dark:text-gray-100">₹{calculatedCropTotal.toLocaleString()}</span>
                </div>

                {/* Primary buttons */}
                <div className="space-y-3">
                  <button
                    onClick={startPurchaseFlow}
                    className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-widest shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    <span>Proceed to Buy</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/20 text-gray-600 dark:text-gray-300 hover:text-primary transition-all text-xs font-bold uppercase tracking-wider cursor-pointer bg-white dark:bg-[#1E293B]"
                    >
                      Add To Cart
                    </button>
                    <button
                      onClick={() => setShowOfferPanel(true)}
                      className="py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-sm shadow-amber-500/10"
                    >
                      Send Offer
                    </button>
                  </div>
                </div>

                {/* Escrow Lock Banner */}
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs font-semibold text-blue-800 leading-normal">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold">100% Escrow Protection Guarded</span>
                    <span className="text-[10px] text-blue-600/80 font-medium block mt-0.5">Payment is safely locked in platform escrow. Funds are only transferred to the grower after gate quality inspection and acceptance.</span>
                  </div>
                </div>

              </div>

              {/* Map Preview Container */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 uppercase tracking-wider">Mandi Location Mapping</h3>
                  <p className="text-xs text-gray-400 font-medium">Visual location profile of agricultural cultivation.</p>
                </div>
                
                {/* Visual SVG mock map */}
                <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative bg-[#E5E9F0] shadow-inner dot-pattern">
                  {/* Google Map stylized SVG representation */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {/* Roads/Grids representation */}
                    <path d="M 0 50 L 300 50 M 120 0 L 120 200 M 0 130 L 300 130" stroke="#FFFFFF" strokeWidth="8" opacity="0.6" />
                    <path d="M 0 50 L 300 50 M 120 0 L 120 200 M 0 130 L 300 130" stroke="#A3BE8C" strokeWidth="2" opacity="0.8" />
                    {/* Secondary roads */}
                    <path d="M 50 0 L 250 200 M 200 0 L 50 200" stroke="#FFFFFF" strokeWidth="4" opacity="0.5" />
                    {/* Farm Area Highlight (Green circle) */}
                    <circle cx="150" cy="100" r="45" fill="#2E7D32" fillOpacity="0.12" stroke="#2E7D32" strokeWidth="1" strokeDasharray="3,3" />
                    <circle cx="150" cy="100" r="25" fill="#2E7D32" fillOpacity="0.15" />
                  </svg>
                  
                  {/* Map Pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary/35 animate-ping" />
                      <div className="w-8 h-8 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow-md text-white relative z-10">
                        {crop.category === 'Grains' ? <Wheat className="w-4.5 h-4.5" /> : crop.category === 'Vegetables' ? <Carrot className="w-4.5 h-4.5" /> : <Droplet className="w-4.5 h-4.5" />}
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold text-charcoal dark:text-gray-100 bg-white dark:bg-[#1E293B]/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs mt-1.5 uppercase tracking-wide">
                      {crop.farmerId.farmLocation}
                    </span>
                  </div>
                </div>

                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(crop.farmerId.farmLocation)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary font-bold hover:underline block text-center uppercase tracking-wider"
                >
                  View Interactive Satellite Map
                </a>
              </div>

            </div>
          </motion.div>
        )}

        {/* CHECKOUT STEP */}
        {purchaseState === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Checkout Form */}
            <form onSubmit={submitCheckout} className="lg:col-span-2 space-y-6">
              
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Building className="w-5 h-5 text-primary" />
                  <span>Business & Shipping Particulars</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-semibold text-gray-500 dark:text-gray-400">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider block">Corporate Buyer Company</label>
                    <input 
                      type="text" 
                      value={billingCompany}
                      onChange={(e) => setBillingCompany(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A]/40 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider block">Contact Authorized Manager</label>
                    <input 
                      type="text" 
                      value={user.firstName ? `${user.firstName} ${user.lastName}` : 'Buyer Manager'} 
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-charcoal dark:text-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider block">Mandi Gate / Factory Shipping Address</label>
                    <textarea 
                      rows="3"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#0F172A]/40 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Logistics Choice */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100 flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Truck className="w-5 h-5 text-primary" />
                  <span>Integrated Mandi Freight Transport</span>
                </h3>

                <div className="space-y-4">
                  {[
                    { id: 'agrinova', label: 'AgriNova Express Logistics', price: '₹150 / qtl', desc: 'Secure temperature-controlled bulk cargo logistics. Includes transit damage insurance. Est. Delivery: 3-5 Business Days.' },
                    { id: 'mandi', label: 'Standard Mandi Transport Partner', price: '₹80 / qtl', desc: 'Open flat-bed cargo transport via licensed marketplace logistics vendors. Est. Delivery: 5-7 Business Days.' },
                    { id: 'self', label: 'Buyer Self-Pickup Logistics', price: '₹0', desc: 'Buyers arrange their own transportation from the farm storage gate. Est. Pickup: 2-3 Business Days.' }
                  ].map((option) => (
                    <label 
                      key={option.id} 
                      className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all block ${
                        logisticsProvider === option.id 
                          ? 'bg-primary/5 border-primary/20 ring-2 ring-primary/5' 
                          : 'bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="logistics" 
                        value={option.id}
                        checked={logisticsProvider === option.id}
                        onChange={() => setLogisticsProvider(option.id)}
                        className="mt-1 accent-primary cursor-pointer shrink-0"
                      />
                      
                      <div className="space-y-1 font-semibold text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-charcoal dark:text-gray-100 font-bold">{option.label}</span>
                          <span className="text-sm text-primary font-extrabold">{option.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPurchaseState('details')}
                  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-charcoal dark:text-gray-100 transition-all text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1E293B] cursor-pointer"
                >
                  Back to Details
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider shadow-sm shadow-primary/10 cursor-pointer"
                >
                  Proceed to Payment
                </button>
              </div>

            </form>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100 pb-3 border-b border-gray-100 dark:border-gray-800">B2B Contract Invoice Summary</h3>
                
                <div className="space-y-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
                      <img src={typeof crop.images[0] === 'object' ? (crop.images[0]?.secure_url || crop.images[0]?.url) : crop.images[0]} alt={crop.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase tracking-wider">{crop.category}</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold block">{crop.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 font-semibold">
                    <div className="flex justify-between">
                      <span>Rate Per Quintal</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">₹{crop.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected Volume</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">{selectedQty} Quintals</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-50 pt-2 text-charcoal dark:text-gray-100 font-bold">
                      <span>Crop Subtotal</span>
                      <span>₹{calculatedCropTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex justify-between">
                      <span>Mandi Freight transport</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">
                        {logisticsProvider === 'self' ? 'Free (Self)' : `₹${calculatedTransport.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Escrow Fee (1%)</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">₹{calculatedEscrowFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agriculture Cess / Tax (5%)</span>
                      <span className="text-charcoal dark:text-gray-100 font-bold">₹{calculatedTax.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4 text-sm font-display font-extrabold text-charcoal dark:text-gray-100">
                    <span>Invoice Grand Total</span>
                    <span className="text-primary text-lg">₹{calculatedGrandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* PAYMENT STEP */}
        {purchaseState === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
              
              <div className="text-center space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">Secure Platform Escrow Transfer</h3>
                  <p className="text-xs text-gray-400 font-medium">Payment will be securely held in AgriNova Corporate Escrow Account</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 font-semibold text-gray-500 dark:text-gray-400">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider">Select B2B Corporate Transfer Method</h4>
                
                {[
                  { id: 'escrow', label: 'NEFT / RTGS Direct Escrow Deposit', desc: 'Recommended for transactions above ₹1,00,000. Real-time bank settlement and validation.' },
                  { id: 'upi', label: 'Corporate UPI Transfer (GPay / PhonePe / BHIM)', desc: 'Instant confirmation. UPI limit rules apply.' },
                  { id: 'card', label: 'Corporate Credit/Debit Card', desc: 'Secure gate checkout. 2% transactional surcharge applies.' }
                ].map((method, idx) => (
                  <div key={method.id} className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer ${idx === 0 ? 'bg-primary/5 border-primary/20' : 'bg-white dark:bg-[#1E293B] border-gray-100 dark:border-gray-800'}`}>
                    <input type="radio" name="payment_method" defaultChecked={idx === 0} className="mt-1 accent-primary cursor-pointer shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-xs text-charcoal dark:text-gray-100 font-bold block">{method.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium block leading-normal">{method.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 space-y-3 font-semibold text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Contract Party</span>
                  <span className="text-charcoal dark:text-gray-100 font-bold">{billingCompany}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Lock Deposit</span>
                  <span className="text-primary font-extrabold text-sm">₹{calculatedGrandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700/60 pt-2.5">
                  <span>Escrow Lock Condition</span>
                  <span className="text-charcoal dark:text-gray-100 font-bold text-right">Released only upon Mandi Inspection Approval</span>
                </div>
              </div>

              {/* Terms Warning */}
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs font-semibold text-amber-800 leading-normal">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700/80 font-semibold">
                  By clicking below, you authorize AgriNova Escrow Services to lock <strong>₹{calculatedGrandTotal.toLocaleString()}</strong> in trust. Funds will only be released to {farmerName} after cargo arrival verification, QC clearance, and your explicit mobile approval.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 gap-4">
                <button
                  onClick={() => setPurchaseState('checkout')}
                  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-charcoal dark:text-gray-100 transition-all text-xs font-bold uppercase tracking-wider bg-white dark:bg-[#1E293B] cursor-pointer"
                >
                  Back to Logistics
                </button>
                
                <button
                  onClick={completePayment}
                  className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>Authorize & Lock Payment</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* ORDER TRACKING & FARMER SIMULATOR DASHBOARD */}
        {purchaseState === 'tracking' && activeOrder && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            
            {/* Left Side: Order particulars */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Core Order Info Card */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] flex items-start justify-end p-4">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-bold block ${
                    simulatedStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                    simulatedStatus === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                    simulatedStatus === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {simulatedStatus}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">Wholesale Purchase Contract</span>
                  <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">{activeOrder.product.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">Order ID: <strong className="font-mono text-gray-700 dark:text-gray-200">{activeOrder.id}</strong> &bull; Date: {activeOrder.date}</span>
                </div>

                {/* Specifics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-50 font-semibold text-gray-500 dark:text-gray-400 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Volume Contracted</span>
                    <span className="text-charcoal dark:text-gray-100 font-bold mt-1 block">{activeOrder.product.qty}</span>
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Direct grower</span>
                    <span className="text-charcoal dark:text-gray-100 font-bold mt-1 block">{activeOrder.farmer}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">AgriNova Escrow Protection</span>
                    <span className="text-primary font-bold mt-1 block flex items-center gap-1">
                      <ShieldCheck className="w-4.5 h-4.5 fill-current" />
                      {activeOrder.payment.status}
                    </span>
                  </div>
                </div>

                {/* Logistics route */}
                <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 space-y-1 font-semibold text-xs text-gray-550">
                  <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Delivery coordinates</span>
                  <div className="flex items-start gap-1.5 text-charcoal dark:text-gray-100 font-bold mt-1">
                    <MapPin className="w-4.5 h-4.5 text-gray-300 shrink-0" />
                    <span>{shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Buyer View Tracker: Stepper */}
              <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-charcoal/5 dark:border-white/5 shadow-xs p-6 sm:p-8 space-y-6">
                <h3 className="font-display font-extrabold text-base text-charcoal dark:text-gray-100 flex items-center gap-2 pb-3 border-b border-gray-50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Fulfillment Pipeline Timeline</span>
                </h3>
                
                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
                  {[
                    { title: 'Order Placed & Escrow Locked', desc: 'Wholesale contract request submitted to grower.', stepVal: 'Pending', time: activeOrder.statusTimestamps?.placedAt || activeOrder.date },
                    { title: 'Contract Accepted', desc: 'Grower accepted contract details, scheduling harvest.', stepVal: 'Accepted', time: activeOrder.statusTimestamps?.acceptedAt },
                    { title: 'QC Verified & Packed', desc: 'Crop sorting, moisture checked & bagged in progress.', stepVal: 'Processing', time: activeOrder.statusTimestamps?.processingAt },
                    { title: 'Ready For Dispatch', desc: 'Quality lab certificate issued, cargo loading scheduled.', stepVal: 'Ready For Dispatch', time: activeOrder.statusTimestamps?.processingAt },
                    { title: 'Dispatched & In Transit', desc: 'Logistics cargo truck dispatched from grower storage.', stepVal: 'Shipped', time: activeOrder.statusTimestamps?.shippedAt },
                    { title: 'Delivered & Completed', desc: 'Escrow released to grower after cargo inspection.', stepVal: 'Delivered', time: activeOrder.statusTimestamps?.deliveredAt }
                  ].map((step, idx) => {
                    const statuses = ['Pending', 'Accepted', 'Processing', 'Ready For Dispatch', 'Shipped', 'Delivered'];
                    const currentIdx = statuses.indexOf(simulatedStatus);
                    const targetIdx = statuses.indexOf(step.stepVal);
                    
                    const isDone = simulatedStatus !== 'Cancelled' && (currentIdx >= targetIdx || idx === 0);
                    const isActive = simulatedStatus !== 'Cancelled' && (currentIdx === targetIdx);
                    
                    return (
                      <div key={idx} className="relative font-semibold">
                        <span className={`absolute -left-10.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-primary border-primary text-white shadow-sm ring-4 ring-primary/15' 
                            : isActive 
                              ? 'bg-amber-500 border-amber-500 text-white animate-pulse ring-4 ring-amber-500/15'
                              : 'bg-white dark:bg-[#1E293B] border-gray-300 text-gray-300'
                        }`}>
                          {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </span>
                        
                        <div className="space-y-0.5">
                          <h4 className={`text-sm font-bold ${isDone ? 'text-charcoal dark:text-gray-100' : 'text-gray-300'}`}>
                            {step.title}
                          </h4>
                          <p className={`text-xs font-medium leading-normal ${isDone ? 'text-gray-400' : 'text-gray-255'}`}>
                            {step.desc}
                          </p>
                          {isDone && step.time && (
                            <p className="text-[10px] text-primary font-bold mt-1">
                              {step.time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Red step if Cancelled or Rejected */}
                  {(simulatedStatus === 'Cancelled' || simulatedStatus === 'Rejected') && (
                    <div className="relative border-l-2 border-red-500 pl-4 py-2 bg-red-50/50 rounded-xl mt-4">
                      <span className="absolute -left-[31px] top-4 w-5 h-5 rounded-full bg-red-650 text-white border-2 border-red-650 flex items-center justify-center shadow-sm">
                        <X className="w-3 h-3 stroke-[3]" />
                      </span>
                      <h4 className="text-sm font-bold text-red-650">Order Rejected / Cancelled</h4>
                      <p className="text-xs text-red-700 mt-1 font-semibold">
                        {activeOrder.statusTimestamps?.cancelledAt || 'The contract proposal was declined.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Side: FARMER ACTION SIMULATOR CONTROL CENTER */}
            <div className="space-y-6">
              
              <div className="bg-gradient-to-br from-charcoal to-charcoal-light rounded-[32px] border border-charcoal text-white shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-white dark:bg-[#1E293B]/5 rounded-full" />
                
                <div>
                  <span className="text-[10px] text-primary-light font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-light animate-pulse" />
                    AgriNova Sandbox Simulator
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-white mt-1">Grower / Farmer Dashboard Simulator</h3>
                  <p className="text-[10px] text-gray-300 font-semibold mt-1 leading-normal">
                    This control center acts as the grower's panel. Advance the logistics pipeline steps below to watch the buyer's tracking interface update in real-time.
                  </p>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-white/10 font-bold text-xs uppercase tracking-wider">
                  <span className="text-[10px] text-gray-400 font-extrabold block">Fulfillment Actions (Farmer Side)</span>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => advanceSimulatedStatus('Accepted')}
                      disabled={simulatedStatus !== 'Pending'}
                      className={`w-full py-3 rounded-xl transition-all flex items-center justify-between px-4 text-xs font-bold cursor-pointer ${
                        simulatedStatus === 'Pending'
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B]/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>1. Accept Wholesale Contract</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => advanceSimulatedStatus('Processing')}
                      disabled={simulatedStatus !== 'Accepted'}
                      className={`w-full py-3 rounded-xl transition-all flex items-center justify-between px-4 text-xs font-bold cursor-pointer ${
                        simulatedStatus === 'Accepted'
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B]/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>2. Pack & Verify Quality</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => advanceSimulatedStatus('Ready For Dispatch')}
                      disabled={simulatedStatus !== 'Processing'}
                      className={`w-full py-3 rounded-xl transition-all flex items-center justify-between px-4 text-xs font-bold cursor-pointer ${
                        simulatedStatus === 'Processing'
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B]/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>3. Complete Lab QC Seals</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => advanceSimulatedStatus('Shipped')}
                      disabled={simulatedStatus !== 'Ready For Dispatch'}
                      className={`w-full py-3 rounded-xl transition-all flex items-center justify-between px-4 text-xs font-bold cursor-pointer ${
                        simulatedStatus === 'Ready For Dispatch'
                          ? 'bg-primary hover:bg-primary-dark text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B]/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>4. Dispatch Cargo Truck</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => advanceSimulatedStatus('Delivered')}
                      disabled={simulatedStatus !== 'Shipped'}
                      className={`w-full py-3 rounded-xl transition-all flex items-center justify-between px-4 text-xs font-bold cursor-pointer ${
                        simulatedStatus === 'Shipped'
                          ? 'bg-secondary hover:bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1E293B]/5 text-white/30 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <span>5. Deliver & Release Escrow</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => advanceSimulatedStatus('Cancelled')}
                      disabled={simulatedStatus === 'Delivered' || simulatedStatus === 'Cancelled'}
                      className={`flex-1 py-3 rounded-xl transition-all text-xs font-bold text-center border cursor-pointer ${
                        simulatedStatus !== 'Delivered' && simulatedStatus !== 'Cancelled'
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      Reject Contract
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setPurchaseState('details');
                        setSimulatedStatus('Pending');
                        setActiveOrder(null);
                      }}
                      className="flex-1 py-3 rounded-xl transition-all text-xs font-bold text-center bg-white dark:bg-[#1E293B]/10 hover:bg-white dark:bg-[#1E293B]/15 text-white cursor-pointer"
                    >
                      Reset Demo
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#1E293B]/5 border border-white/10 text-[10px] font-semibold text-gray-300 leading-relaxed font-medium">
                  <Info className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                  <span>
                    When marked <strong>Delivered</strong>, the Escrow Status updates to <strong>Released to Farmer</strong>, illustrating B2B payout automation.
                  </span>
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SIDEBAR / PANEL NEGOTIATOR (OFFER DRAWER) */}
      <AnimatePresence>
        {showOfferPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOfferPanel(false)}
              className="absolute inset-0 bg-black backdrop-blur-xs"
            />

            {/* Sliding cabinet */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white dark:bg-[#1E293B] border-l border-charcoal/5 dark:border-white/5 shadow-2xl flex flex-col justify-between h-full"
              >
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">Direct B2B Rate negotiation</h3>
                    <p className="text-xs text-gray-400 font-medium">Submit a direct contract proposal to the grower.</p>
                  </div>
                  <button 
                    onClick={() => setShowOfferPanel(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-charcoal dark:text-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleOfferSubmit} className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
                  
                  {/* Quantity selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <label>Proposed Volume (qtl)</label>
                      <span className="text-charcoal dark:text-gray-100 font-bold">Max: {crop.quantity} qtl</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setOfferQty(q => q > 10 ? q - 5 : q)}
                        className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">{offerQty} Quintals</span>
                      <button
                        type="button"
                        onClick={() => setOfferQty(q => q < crop.quantity ? q + 5 : q)}
                        className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pricing selector */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <label>Proposed Rate per Quintal</label>
                      <span className="text-charcoal dark:text-gray-100 font-bold">Asking: ₹{crop.price}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setOfferRate(r => r > 100 ? r - 50 : r)}
                        className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <div className="text-center">
                        <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">₹{offerRate.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400 font-bold block uppercase mt-0.5">
                          {offerRate >= crop.price ? 'Match Asking' : `${Math.round(((crop.price - offerRate) / crop.price) * 100)}% lower rate`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOfferRate(r => r + 50)}
                        className="p-2.5 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Estimated Contract Calculation */}
                  <div className="p-5 rounded-2xl bg-[#F8FAF5] border border-primary/10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span>Direct Contract Value</span>
                      <span className="font-display font-extrabold text-lg text-charcoal dark:text-gray-100">₹{(offerQty * offerRate).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800/40 pt-3">
                      <span>Potential Saving</span>
                      <span className="text-primary font-bold">
                        {offerRate < crop.price ? `₹${((crop.price - offerRate) * offerQty).toLocaleString()}` : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Warning parameters */}
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs font-semibold text-amber-800 leading-normal">
                    <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700/80">
                      Growers evaluate bulk purchase offers based on volume and transport feasibility. Submitting a bid lower than 15% of asking price has lower acceptance rates.
                    </p>
                  </div>

                </form>

                {/* Footer submit */}
                <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-55/20 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOfferPanel(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-charcoal dark:text-gray-100 hover:bg-gray-50 dark:bg-[#0F172A] text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOfferSubmit}
                    className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider text-center cursor-pointer shadow-sm shadow-amber-500/10"
                  >
                    Submit Bid Offer
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CATALOG FOOTER: SIMILAR PRODUCTS & RELATED CROPS */}
      {purchaseState === 'details' && (
        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100 tracking-tight">Similar Mandi Crop Listings</h3>
            <p className="text-sm text-gray-400 font-medium">Verified active crop stocks from surrounding regions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SIMILAR_CROPS_DATA.map((simCrop) => (
              <div 
                key={simCrop.id}
                onClick={() => navigate(`../products/${simCrop.id}`)}
                className="bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-xs overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-primary/10 transition-all cursor-pointer group"
              >
                <div className="w-full h-32 bg-gray-50 dark:bg-[#0F172A] overflow-hidden relative border-b border-gray-50">
                  <img src={simCrop.image} alt={simCrop.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white rounded-md">
                    {simCrop.category}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 truncate">{simCrop.name}</h4>
                  
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-display font-extrabold text-base text-charcoal dark:text-gray-100">₹{simCrop.price.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">/qtl</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-50 pt-2 font-semibold">
                    <span>Qty: {simCrop.quantity} qtl</span>
                    <span className="flex items-center gap-0.5 text-gray-400 truncate max-w-[60%]">
                      <MapPin className="w-3 h-3 text-gray-300" />
                      {simCrop.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

