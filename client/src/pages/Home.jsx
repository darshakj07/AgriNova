import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Products from '../components/Products'
import WeatherDashboard from '../components/WeatherDashboard'
import MandiPrices from '../components/MandiPrices'
import Benefits from '../components/Benefits'
import Testimonials from '../components/Testimonials'
import MobileApp from '../components/MobileApp'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base text-charcoal dark:text-gray-100 font-sans selection:bg-primary/20 selection:text-primary scroll-smooth">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Products />
      <WeatherDashboard />
      <MandiPrices />
      <Benefits />
      <Testimonials />
      <MobileApp />
      <CTA />
      <Footer />
    </div>
  )
}

