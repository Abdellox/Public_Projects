import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import TrustSection from "./components/TrustSection"
import Features from "./components/Features"
import HowItWorks from "./components/HowItWorks"
import DashboardPreview from "./components/DashboardPreview"
import Pricing from "./components/Pricing"
import Testimonials from "./components/Testimonials"
import Faq from "./components/Faq"
import FinalCta from "./components/FinalCta"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-white font-sans text-navy-900 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <TrustSection />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
