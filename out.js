import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, MapPin, MessageSquare, Star, Sprout, Award, Calendar } from "lucide-react";
export default function SupplierProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSupplierAndReviews = async () => {
      try {
        setLoading(true);
        const [farmersRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/farmers`),
          fetch(`${API_BASE}/api/reviews/user/${id}`)
        ]);
        const farmersData = await farmersRes.json();
        if (farmersRes.ok && farmersData.success) {
          const match = farmersData.farmers.find((f) => f._id === id);
          if (match) setFarmer(match);
        }
        const reviewsData = await reviewsRes.json();
        if (reviewsRes.ok && reviewsData.success) {
          setStats({
            avgRating: reviewsData.avgRating,
            totalReviews: reviewsData.totalReviews,
            reviews: reviewsData.reviews
          });
        }
      } catch (err) {
        console.error("Error fetching supplier details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierAndReviews();
  }, [id]);
  if (loading) return /* @__PURE__ */ React.createElement("div", { className: "text-center py-12 text-gray-500 font-semibold" }, "Loading supplier profile...");
  if (!farmer) return /* @__PURE__ */ React.createElement("div", { className: "text-center py-12 text-gray-500 font-semibold" }, "Supplier not found.");
  const mockCrops = [
    { id: 1, name: "Organic Potatoes", rate: "\u20B91,400/qtl", qty: "25 qtl", status: "Available" },
    { id: 2, name: "Sharbati Wheat", rate: "\u20B92,650/qtl", qty: "80 qtl", status: "Available" }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("../suppliers"),
      className: "p-2 rounded-xl border border-gray-100 hover:border-primary/20 text-charcoal/60 hover:text-primary transition-all focus:outline-none"
    },
    /* @__PURE__ */ React.createElement(ArrowLeft, { className: "w-4.5 h-4.5" })
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-display font-extrabold text-2xl text-charcoal" }, "Supplier Profile"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400 font-medium mt-0.5" }, "Accredited farm registry and listed inventory."))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-[32px] border border-charcoal/5 shadow-sm p-6 sm:p-8 text-center space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 rounded-3xl bg-[#F8FAF5] text-primary flex items-center justify-center font-display font-extrabold text-3xl border border-primary/10 mx-auto shadow-sm" }, farmer.firstName?.charAt(0) || "F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-extrabold text-lg text-charcoal leading-snug" }, farmer.firstName, " ", farmer.lastName), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-primary font-bold mt-0.5" }, farmer.farmName || "Grower"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-400 font-semibold flex items-center justify-center gap-1 mt-2" }, /* @__PURE__ */ React.createElement(MapPin, { className: "w-3.5 h-3.5 text-gray-300" }), farmer.farmLocation || "Farm Site")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center gap-1.5 py-1.5 px-3 bg-yellow-550/10 text-yellow-750 border border-yellow-200 rounded-full w-fit mx-auto text-xs font-bold uppercase tracking-wider" }, "\u2B50 ", stats.avgRating > 0 ? stats.avgRating : "N/A", " Rating (", stats.totalReviews, " Reviews)"), /* @__PURE__ */ React.createElement("div", { className: "pt-6 border-t border-gray-50 flex gap-2" }, /* @__PURE__ */ React.createElement(
    Link,
    {
      to: "../messages",
      className: "w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 focus:outline-none"
    },
    /* @__PURE__ */ React.createElement(MessageSquare, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Message Grower")
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-[32px] border border-charcoal/5 shadow-sm p-6 sm:p-8 space-y-4" }, /* @__PURE__ */ React.createElement("h4", { className: "font-display font-bold text-charcoal text-sm uppercase tracking-wider" }, "Accreditations"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3.5 text-xs font-semibold text-gray-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(ShieldCheck, { className: "w-4.5 h-4.5 text-primary shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Verified Land Register (Acreage: ", farmer.farmArea || farmer.farmAcres || "15", " Acres)")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(Award, { className: "w-4.5 h-4.5 text-primary shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Standard Moisture Compliance Accredited")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(Calendar, { className: "w-4.5 h-4.5 text-primary shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Partner Since: June 2024"))))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-[32px] border border-charcoal/5 shadow-sm p-6 sm:p-8 space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-bold text-charcoal" }, "Available Farm Listings"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-400 font-medium mt-0.5" }, "Crop produce currently listed for direct sales.")), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto no-scrollbar" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-sm" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-gray-50 text-xs font-bold text-gray-400 uppercase" }, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Crop Name"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Starting Rate"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Available Qty"), /* @__PURE__ */ React.createElement("th", { className: "pb-3 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "font-semibold text-gray-600 divide-y divide-gray-50" }, mockCrops.map((c) => /* @__PURE__ */ React.createElement("tr", { key: c.id, className: "hover:bg-gray-50/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "py-3.5 text-charcoal font-bold" }, c.name), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 font-extrabold text-charcoal" }, c.rate), /* @__PURE__ */ React.createElement("td", { className: "py-3.5" }, c.qty), /* @__PURE__ */ React.createElement("td", { className: "py-3.5 text-right" }, /* @__PURE__ */ React.createElement(
    Link,
    {
      to: `../products/${c.id}`,
      className: "py-1.5 px-3 rounded-lg border border-gray-100 hover:border-primary/25 text-gray-500 hover:text-primary transition-all text-xs font-extrabold uppercase tracking-wider inline-block"
    },
    "Details / Bid"
  )))))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-[32px] border border-charcoal/5 shadow-sm p-6 sm:p-8 space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-display font-bold text-charcoal flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Star, { className: "w-5 h-5 text-yellow-400 fill-current" }), /* @__PURE__ */ React.createElement("span", null, "Verified Reviews (", stats.totalReviews, ")"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, stats.reviews.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-8 text-gray-400 font-medium" }, "No reviews yet for this supplier.") : stats.reviews.map((rev) => /* @__PURE__ */ React.createElement("div", { key: rev._id, className: "p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-charcoal font-bold" }, rev.reviewerId?.companyName || rev.reviewerId?.firstName || "Buyer")), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 font-semibold block" }, new Date(rev.createdAt).toLocaleDateString())), /* @__PURE__ */ React.createElement("div", { className: "flex gap-0.5 text-accent" }, Array.from({ length: rev.rating }).map((_, i) => /* @__PURE__ */ React.createElement(Star, { key: i, className: "w-3.5 h-3.5 text-yellow-500 fill-current" })))), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 font-semibold leading-relaxed" }, rev.review))))))));
}
