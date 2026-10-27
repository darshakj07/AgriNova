# AgriNova - Project Presentation

> **Project Name**: AgriNova: Smart Agriculture, Direct Marketplace & Decision Support System  
> **Prepared For**: Project Presentation / Viva / Review  
> **Target Audience**: Evaluators, Faculty, Mentors, and Stakeholders  

---

## 📑 Slide Outline / Table of Contents

1. **Slide 1**: Title Slide
2. **Slide 2**: Introduction
3. **Slide 3**: Problem Statement & Challenges
4. **Slide 4**: Project Definition & Objectives
5. **Slide 5**: Project Profile
6. **Slide 6**: Tools and Technology Stack
7. **Slide 7**: System Architecture Diagram
8. **Slide 8**: Key System Modules
9. **Slide 9**: Users of the System (Actors & Roles)
10. **Slide 10**: Core Functionalities - Marketplace & Direct Trade
11. **Slide 11**: Core Functionalities - AgriBot & AI Moderation
12. **Slide 12**: Core Functionalities - Decision Support, Mandi & Weather
13. **Slide 13**: Core Functionalities - Admin Governance & Verification
14. **Slide 14**: Database Schema & Entity Relationships
15. **Slide 15**: Key Highlights & Competitive Advantages
16. **Slide 16**: Future Scope & Enhancements
17. **Slide 17**: Conclusion & Q&A

---

## 📽️ Slide 1: Title Slide

### **AgriNova: Smart Agriculture, Marketplace & Decision Support System**
*Bridging Farmers, Direct Buyers, and Smart AI Decision Support*

- **Presented By**: [Your Name / Team Members]
- **Enrollment / Roll No**: [Your Roll Numbers]
- **Guide / Mentor**: [Mentor Name]
- **Department**: Computer Engineering / Information Technology
- **Academic Year**: 2025–2026

---

## 📽️ Slide 2: Introduction

### **What is AgriNova?**
AgriNova is an integrated, next-generation digital agro-ecosystem engineered to eliminate exploitative middlemen from the agricultural value chain. It unifies:
1. **Direct Digital Marketplace**: Connects local farmers directly with wholesale and retail buyers.
2. **AgriBot AI Advisory**: Provides real-time crop disease diagnosis, cultivation tips, and localized farming assistance.
3. **Smart Decision Support**: Delivers real-time mandi (market) prices, meteorological forecasting, and interactive sales analytics.
4. **Trust & Governance**: Features AI-driven chat moderation, admin farmer-verification, and integrated dispute resolution.

### **Why AgriNova Matters?**
- Agriculture sustains over 50% of the workforce, yet farmers receive only a small fraction of the end-consumer price.
- Lack of transparent pricing, crop diagnostics, and verified direct trade leads to heavy post-harvest losses and financial strain.

---

## 📽️ Slide 3: Problem Statement & Challenges

### **Core Industry Problems:**
- **Middleman Exploitation**: Traditional supply chains contain multi-tiered intermediaries who capture the lion's share of profits while farmers struggle.
- **Information Asymmetry**: Farmers lack transparent, real-time access to mandi market trends and fluctuating crop prices.
- **Delayed Advisory & Disease Control**: Traditional extension services are slow to detect crop illnesses and advise corrective pesticides/fertilizers.
- **Communication & Fraud Risks**: Unmonitored direct buyer-seller negotiations often risk fraud, spam, or off-platform defaults.
- **Logistics & Order Visibility Gaps**: Absence of digital proof of purchase, structured cart checkout, and automated PDF invoice generation.

---

## 📽️ Slide 4: Project Definition & Objectives

### **Project Definition:**
> *"To design and develop a full-stack, secure, AI-powered web platform that bridges farmers and buyers for direct trade, empowers agricultural decision-making through mandi pricing and weather intelligence, and protects platform integrity using automated AI moderation."*

### **Key Project Objectives:**
- **Direct Monetization**: Enable farmers to showcase produce with bulk pricing, harvesting dates, stock alerts, and high-resolution media.
- **Intelligent Assistance**: Integrate an LLM-based AgriBot for instant farming advisory and disease mitigation suggestions.
- **Market Transparency**: Deliver real-time mandi price trends and localized weather forecasting.
- **Real-Time Collaboration**: Provide instant Socket.io messaging with automated AI content moderation.
- **End-to-End Governance**: Implement a granular Admin Panel for credential verification, order monitoring, category management, and dispute tickets.

---

## 📽️ Slide 5: Project Profile

| Parameter | Details |
| :--- | :--- |
| **Project Title** | AgriNova: Smart Agriculture, Marketplace & Decision Support System |
| **Project Type** | Full-Stack Web Application / Agricultural ERP & E-Commerce |
| **Architecture** | Client-Server Architecture (RESTful API + Real-Time WebSockets) |
| **Frontend Framework** | React 19 + Vite + Tailwind CSS |
| **Backend Framework** | Node.js + Express.js (ES Modules) |
| **Database** | MongoDB Atlas (NoSQL) with Mongoose ODM |
| **AI / LLM Integration** | Groq SDK (Llama 3 / Mixtral for AgriBot & Chat Moderation) |
| **Cloud Storage** | Cloudinary (Crop photos, identity verification proofs) |
| **Communication Layer**| Socket.io (Instant Chat, Notifications) & Nodemailer (Transactional Emails) |
| **Authentication** | JSON Web Tokens (JWT) & Google OAuth 2.0 |
| **Live Deployments** | Frontend: Vercel \| Backend: Render |

---

## 📽️ Slide 6: Tools and Technology Stack

### **1. Frontend Layer**
- **React 19 & Vite**: Ultra-fast component rendering, virtual DOM, and modern build tooling.
- **Tailwind CSS v4 & Framer Motion**: Responsive, fluid UI design with micro-interactions and dark-mode ready themes.
- **Recharts**: Interactive visual graphs for revenue, sales trends, and order volumes.
- **Leaflet & React-Leaflet**: Interactive geolocation maps for farm locations and delivery coverage.
- **jsPDF & jsPDF-AutoTable**: Client-side dynamic PDF invoice/receipt generation.
- **Lucide React**: Clean, accessible iconography.

### **2. Backend Layer**
- **Node.js & Express.js**: Asynchronous, event-driven RESTful API micro-services.
- **Socket.io**: Bidirectional, low-latency WebSocket communication for real-time chat.
- **Nodemailer**: Automated OTP delivery, order status emails, and notifications.
- **Bcrypt.js & JWT**: Password hashing and stateless token-based authorization.
- **Multer**: Multi-part form handling for file and image uploads.

### **3. Database & Cloud Services**
- **MongoDB Atlas**: High-availability NoSQL document store.
- **Mongoose**: Strict schema modeling, data sanitization, and pre-save hooks.
- **Cloudinary**: Optimized media delivery, transformation, and storage.
- **Groq Cloud API**: Ultra-low-latency LPU inference for AI AgriBot and content moderation.

---

## 📽️ Slide 7: System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +--------------------+   +--------------------+   +---------------------------+  |
|  |    Farmer Portal   |   |    Buyer Portal    |   |     Admin Dashboard       |  |
|  | (Crops/Mandi/Orders|   | (Marketplace/Cart/ |   | (Verifications/Disputes/  |  |
|  |  /Weather/Chatbot) |   |  Checkout/Tracking)|   |  Analytics/Moderation)    |  |
|  +--------------------+   +--------------------+   +---------------------------+  |
|            | React 19, Tailwind CSS, Framer Motion, Socket.io Client, Leaflet     |
+------------|----------------------------------------------------------------------+
             | (HTTPS / REST API)                             | (WSS / WebSockets)
             v                                                v
+-----------------------------------------------------------------------------------+
|                                BACKEND SERVER (Node.js & Express)                 |
|  +-----------------------------------------------------------------------------+  |
|  | REST API Routers:                                                           |  |
|  | - authRoutes      - productRoutes    - orderRoutes     - reviewRoutes       |  |
|  | - categoryRoutes  - messageRoutes    - ticketRoutes    - chatbotRoutes      |  |
|  | - adminRoutes     - subscriberRoutes - uploadRoutes                         |  |
|  +-----------------------------------------------------------------------------+  |
|  | Middleware: AuthGuard (JWT) | Multer Uploader | Role Validator (RBAC)       |  |
|  | Services: ModerationService | EmailService (Nodemailer) | Socket Controller |  |
+-----------------------------------------------------------------------------------+
       |                     |                        |                     |
       v                     v                        v                     v
+---------------+   +-------------------+   +--------------------+   +--------------+
|   DATABASE    |   |     AI ENGINE     |   |   ASSET STORAGE    |   | NOTIFICATIONS|
| MongoDB Atlas |   |     Groq Cloud    |   |     Cloudinary     |   |  Nodemailer  |
| - Users       |   | - AgriBot Advisory|   | - Crop Media       |   | - OTP / Auth |
| - Products    |   | - Chat Moderation |   | - Verification Docs|   | - Receipts   |
| - Orders/Chat |   |   (LPU Inference) |   |   (CDN Delivery)   |   | - Updates    |
+---------------+   +-------------------+   +--------------------+   +--------------+
```

---

## 📽️ Slide 8: Key System Modules

AgriNova is modularly structured into five core pillars:

1. **Authentication & Identity Access Management (IAM)**
   - Role-Based Access Control (Admin, Farmer, Buyer).
   - Dual-mode sign-in: Email/Password with JWT and Google OAuth 2.0.
   - OTP email verification for account security and password resets.

2. **Produce Marketplace & Order Fulfillment**
   - Catalog management, stock control, bulk pricing tiers, and crop tags.
   - Interactive shopping cart, live order tracking, and dynamic PDF invoice generation.

3. **AgriBot Advisory & AI Moderation Module**
   - Generative AI agricultural assistant powered by Groq.
   - Real-time automated scan of buyer-seller chats to block prohibited off-platform actions and offensive text.

4. **Agri-Intelligence & Decision Support System (DSS)**
   - Real-time Mandi price tracker across crop categories.
   - Weather forecast engine providing rain, humidity, and temperature data for farm planning.
   - Revenue and inventory performance dashboards.

5. **Administration, Verification & Dispute Management**
   - Farmer credential verification workflow (KYC/identity checks).
   - Category management, user access control, message audit logs, and support ticketing.

---

## 📽️ Slide 9: Users of the System (Actors & Roles)

### **1. Farmer (Seller)**
- Registers profile with farm location and identity details for verification.
- Adds, edits, and manages crop listings (stock, minimum order, harvesting date, images).
- Monitors buyer orders and transitions fulfillment status (Pending -> Processing -> Shipped -> Delivered).
- Accesses Mandi rates, localized weather forecasts, and sales analytics charts.
- Chats directly with buyers for negotiation and receives AI diagnostic guidance via AgriBot.

### **2. Buyer (Wholesaler / Retailer / Consumer)**
- Browses crop catalogs with multi-faceted search (category, rating, location, price).
- Adds items to cart, selects delivery address, and completes orders.
- Tracks order progress in real-time and downloads official PDF invoices.
- Rates and reviews purchased produce; chats directly with farmers.
- Manages wishlist items and raises support tickets if issues occur.

### **3. Admin (Platform Governance & Superuser)**
- Audits farmer verification requests and approves/rejects badges.
- Oversees system health: total revenue, order volume, and platform activity metrics.
- Manages crop categories, reviews flagged chats, and resolves customer support tickets.
- Oversees user statuses (Active/Suspended) and manages newsletter subscribers.

---

## 📽️ Slide 10: Core Functionalities - Marketplace & Direct Trade

- **Dynamic Crop Cataloging**: Farmers configure price per kg/quintal, available quantity, organic badges, and harvest date.
- **Advanced Discovery**: Buyers utilize elastic filtering by category (Cereals, Fruits, Vegetables, Spices, Pulses), price sliders, and farmer ratings.
- **Cart & Order Lifecycle**:
  - Multi-item cart management with stock validation.
  - Multi-stage order status transitions: `Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.
- **Instant Invoicing**: Generates downloadable, tamper-proof PDF tax invoices featuring buyer details, line items, and totals via `jspdf-autotable`.
- **Ratings & Reviews**: Verified buyers submit star ratings and detailed reviews, fostering community trust.

---

## 📽️ Slide 11: Core Functionalities - AgriBot & AI Moderation

### **AgriBot - 24/7 AI Farming Advisor**
- Powered by high-speed Groq LPU inference.
- Provides immediate answers on pest remedies, soil nutrient management, best planting seasons, and disease mitigation.
- Formatted markdown responses for clear, readable instructions.

### **Intelligent Chat Moderation**
- Analyzes buyer-farmer chat conversations in real-time.
- Automatically flags or redacts prohibited off-platform transactions, sensitive phone/payment disclosures, or abusive content.
- Protects both farmers and buyers from fraud while keeping trades safe and verified.

---

## 📽️ Slide 12: Core Functionalities - Decision Support, Mandi & Weather

### **Live Mandi Price Intelligence**
- Tracks daily prevailing wholesale rates for major crops.
- Enables farmers to benchmark prices before listing, preventing distress selling.

### **Integrated Meteorological Insights**
- Localized weather forecasts (Temperature, Humidity, Wind Speed, Precipitation).
- Alerts farmers about upcoming rain and adverse weather to protect harvested crops.

### **Interactive Visual Analytics**
- Powered by Recharts.
- Visual breakdown of top-selling crops, monthly revenue trends, and pending fulfillment statistics.

---

## 📽️ Slide 13: Core Functionalities - Admin Governance & Verification

- **Farmer Verification Portal**: Review KYC documents and farm proof before granting verified green checkmarks.
- **Platform Health Monitoring**: Real-time KPI counters for Total Gross Merchandise Value (GMV), Registered Farmers, Buyers, and Active Orders.
- **Support Ticket Resolution**: Farmers and buyers can submit support tickets with priority levels; Admins resolve and respond with status updates.
- **Category & System Configuration**: Dynamic addition/editing of agricultural categories and platform parameters.

---

## 📽️ Slide 14: Database Schema & Entity Relationships

```
+-------------------+       +-------------------+       +-------------------+
|      User         |       |      Product      |       |      Order        |
+-------------------+       +-------------------+       +-------------------+
| _id (PK)          | 1   * | _id (PK)          | 1   * | _id (PK)          |
| name, email, pass |------>| farmerId (FK)     |------>| buyerId (FK)      |
| role (Farmer/     |       | categoryId (FK)   |       | farmerId (FK)     |
|   Buyer/Admin)    |       | title, price, unit|       | items[], subtotal |
| isVerified, phone |       | stock, images[]   |       | status, address   |
| location, avatar  |       | harvestDate       |       | invoiceNumber     |
+-------------------+       +-------------------+       +-------------------+
          |                           |                           |
          | 1                         | 1                         |
          v *                         v *                         |
+-------------------+       +-------------------+                 |
|      Message      |       |      Review       |                 |
+-------------------+       +-------------------+                 |
| _id (PK)          |       | _id (PK)          |                 |
| senderId (FK)     |       | productId (FK)    |                 |
| receiverId (FK)   |       | userId (FK)       |                 |
| text, isFlagged   |       | rating (1-5)      |                 |
| createdAt         |       | comment           |                 |
+-------------------+       +-------------------+                 |
                                                                  |
+-------------------+       +-------------------+                 |
|      Ticket       |       |     Category      |                 |
+-------------------+       +-------------------+                 |
| _id (PK)          |       | _id (PK)          |                 |
| userId (FK)       |       | name, icon, desc  |                 |
| subject, status   |       | isActive          |                 |
+-------------------+       +-------------------+                 |
```

---

## 📽️ Slide 15: Key Highlights & Competitive Advantages

| Traditional Agro Markets | Typical E-Commerce | **AgriNova Solution** |
| :--- | :--- | :--- |
| Exploitative intermediaries taking up to 40-60% profit | High listing commissions and generic non-farm UX | **0% middleman cut; direct farmer-to-buyer transactions** |
| Zero disease diagnostics or guidance for growers | No domain-specific advisory | **Built-in Groq AI AgriBot for instant diagnosis** |
| Blind pricing without knowledge of current mandi rates | Static prices without market reference | **Integrated Mandi intelligence & weather alerts** |
| High fraud and off-platform payment risks | Generalized customer care | **Real-time AI Chat Moderation & verified farmer badges** |
| Paper receipts and manual bookkeeping | Generic PDF invoices | **Dynamic agricultural invoice generation with jsPDF** |

---

## 📽️ Slide 16: Future Scope & Enhancements

- **Integrated Digital Escrow & Payment Gateways**: Integration with Razorpay / Stripe for automated milestone-based buyer payment releases.
- **IoT Soil & Sensor Integration**: Real-time telemetry inputs (soil moisture, pH, temperature) fed into AgriBot for hyper-personalized recommendations.
- **Multilingual & Voice Interface**: Vernacular language support (Hindi, Gujarati, Marathi, etc.) with speech-to-text for non-English speaking farmers.
- **Smart Logistics & Cold Chain Aggregation**: Third-party logistics (3PL) integration with refrigerated fleet tracking for perishable goods.
- **Computer Vision Disease Detection**: Uploading leaf photos directly to detect diseases using fine-tuned vision models.

---

## 📽️ Slide 17: Conclusion & Q&A

### **Summary:**
- AgriNova successfully bridges the agricultural divide by combining **Direct E-Commerce**, **GenAI Advisory**, and **Data-Driven Market Intelligence**.
- The solution empowers farmers with higher income margins, provides buyers with fresher produce at transparent rates, and ensures digital trust through administrative verification and AI moderation.

### **Live Demonstration & Links:**
- 🌐 **Web App**: `https://agri-nova-chi.vercel.app/`
- ⚙️ **Backend API**: `https://agrinova-backend-jdjq.onrender.com/`

---

### **Thank You!**
*Questions & Discussions are warmly welcomed.*
