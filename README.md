# AgriNova: Smart Agriculture, Marketplace & Decision Support System

AgriNova is an end-to-end intelligent agriculture, marketplace, and agricultural decision-support ecosystem. It connects farmers, buyers/consumers, and administrators with smart tools including AI advisory, crop price discovery (Mandi prices), live chat moderation, geo-location mapping, and automated order/invoice processing.

---

## 🌟 Key Modules & Features

### 🌾 1. Direct Marketplace
- **Farmer Listings**: Farmers can catalog produce with detailed specifications, bulk pricing, stock thresholds, harvest dates, and high-resolution imagery.
- **Buyer Exploration**: Buyers can filter by crop category, price range, proximity, farmer ratings, and availability.
- **Order Management & Cart**: Cart, checkout, order tracking, and status transitions (Pending, Processing, Shipped, Delivered, Cancelled).

### 🤖 2. AgriBot & AI Advisory
- **Intelligent Assistant**: Integrated AI chatbot providing real-time disease diagnostic assistance, cultivation guidance, and localized weather tips.
- **Automated Chat Moderation**: AI moderation that analyzes buyer-seller conversations to prevent spam, detect off-platform fraud, and uphold community trust.

### 📊 3. Decision Support & Analytics
- **Live Mandi Price Tracking**: Market intelligence helping farmers make informed decisions about pricing their produce.
- **Weather Insights**: Integrated weather dashboard and forecast widgets tailored for agricultural needs.
- **Visual Analytics**: Interactive revenue, sales, and order trend graphs built using Recharts.

### 🛡️ 4. Administration & Verification
- **Verification Management**: Admin portal for verifying farmer credentials and certifications.
- **Dispute & Support Ticketing**: Centralized issue ticketing system.
- **Platform Analytics**: Comprehensive dashboard to monitor transaction volume, user growth, and listings.

---

## 🏗️ Architecture & Technology Stack

### Frontend (`client/`)
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **Icons**: Lucide React
- **Mapping**: Leaflet, React Leaflet
- **Data Visualization**: Recharts
- **Networking & Real-Time**: Socket.io Client, Fetch API
- **Authentication**: Google OAuth (`@react-oauth/google`) & JWT
- **Documents**: jsPDF & jsPDF-AutoTable for automated receipt generation

### Backend (`server/`)
- **Environment**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Communication**: Socket.io
- **AI Engine**: Groq SDK
- **Asset Storage**: Cloudinary & Multer
- **Notification Services**: Nodemailer for automated email dispatch
- **Security**: Bcrypt.js, JSON Web Tokens (JWT)

---

## 📁 Repository Directory Structure

```
AgriNova/
├── client/                     # Frontend Application
│   ├── public/                 # Static branding, 3D icons, and assets
│   ├── src/
│   │   ├── admin/              # Admin dashboard, management pages & tables
│   │   ├── buyer/              # Buyer marketplace, cart, orders, wishlist
│   │   ├── farmer/             # Farmer management, crops, analytics, weather
│   │   ├── components/         # Shared UI components (Navbar, Footer, Chatbot, etc.)
│   │   ├── context/            # React context providers (Theme, etc.)
│   │   ├── pages/              # Landing, Auth (Login/Register), Public pages
│   │   ├── App.jsx             # Main application router
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend API & WebSocket Server
│   ├── config/                 # DB connection, Cloudinary, Admin Seeder
│   ├── controllers/            # Controller business logic
│   ├── middleware/             # JWT auth & Multer upload middleware
│   ├── models/                 # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/                 # Express API endpoints
│   ├── services/               # AI Moderation, Email Services
│   ├── server.js               # Express application and Socket.io bootstrap
│   └── package.json
│
├── .gitignore                  # Git ignore definitions
└── README.md                   # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)
- A [Groq API](https://console.groq.com/) key (for AI Advisory & Moderation)
- [Cloudinary](https://cloudinary.com/) account (for media storage)

---

### Configuration

#### 1. Backend Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Groq Cloud AI
GROQ_API_KEY=your_groq_api_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

#### 2. Frontend Environment Setup
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

### Installation & Execution

#### Running the Backend
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

#### Running the Frontend
```bash
cd client
npm install
npm run dev
```
The client application will start at `http://localhost:5173`.

---

## 🔒 Security Best Practices
- Environment variables (`.env`) are strictly excluded from version control via `.gitignore`.
- API keys, database credentials, and secrets should only be provided via `.env` or production secret management.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
