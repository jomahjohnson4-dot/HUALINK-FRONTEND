import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Layers,
  UserCheck,
  Search,
  PackageCheck
} from 'lucide-react';

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slides = [
    {
      id: 1,
      title: "Hualink Direct Distribution Hub",
      subtitle: "VERIFIED STOCK & DIRECT REGIONAL SUPPLY",
      description: "Empowering businesses across Tanzania with direct distribution, verified inventory, and seamless bulk ordering.",
      buttonText: "Browse Catalog",
      buttonLink: "/shop",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600",
    },
    {
      id: 2,
      title: "TeKeL Graphics & Brand Design",
      subtitle: "CREATIVE SOLUTIONS & PRINTING",
      description: "High-end corporate branding, custom graphics design, and commercial promotional printing packages.",
      buttonText: "Explore Services",
      buttonLink: "/services",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1600",
    },
    {
      id: 3,
      title: "IT & Hardware Distribution",
      subtitle: "ELECTRONICS & NETWORK MAINTENANCE",
      description: "Quality hardware stock, networking maintenance setup, and enterprise office furniture solutions.",
      buttonText: "Learn More",
      buttonLink: "/shop",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1600",
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in minutes to access direct regional distribution rates, stock tracking, and TeKeL services.",
      linkText: "Get Started",
      linkUrl: "/register",
      icon: UserCheck
    },
    {
      number: "02",
      title: "Browse & Select",
      description: "Explore verified hardware stock, custom furniture, or request TeKeL brand design services across Tanzania.",
      linkText: "Explore Catalog",
      linkUrl: "/shop",
      icon: Search
    },
    {
      number: "03",
      title: "Order & Receive",
      description: "Place bulk or individual supply orders and track rapid regional dispatch straight to your regional depot.",
      linkText: "Track Order",
      linkUrl: "/orders",
      icon: PackageCheck
    }
  ];

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen">
      
      {/* ================= 1. HERO SLIDER SECTION ================= */}
      <section className="relative bg-slate-900 h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden">
        
        {/* Horizontal Slide Container */}
        <div 
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="w-full h-full shrink-0 relative">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
              {/* Left-side subtle light gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 via-45% to-transparent" />
            </div>
          ))}
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-xl space-y-6">
            
            <div className="inline-block border-l-4 border-red-600 pl-3">
              <span className="text-xs font-black uppercase tracking-widest text-red-600">
                {slides[currentSlide].subtitle}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-900">
              {slides[currentSlide].title}
            </h1>

            <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed max-w-md">
              {slides[currentSlide].description}
            </p>

            <div className="pt-2">
              <Link 
                to={slides[currentSlide].buttonLink} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-all inline-flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <span>{slides[currentSlide].buttonText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom Feature Bar */}
        <div className="relative z-10 border-t border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 gap-6 text-center md:text-left">
            
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">Verified Stock</span>
                <span className="text-[10px] text-slate-500 font-semibold">Quality Checked</span>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 border-x border-slate-200 px-4">
              <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <Truck size={18} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">Direct Dispatch</span>
                <span className="text-[10px] text-slate-500 font-semibold">All Tanzania Regions</span>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                <Layers size={18} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">TeKeL Services</span>
                <span className="text-[10px] text-slate-500 font-semibold">Branding & Tech</span>
              </div>
            </div>

          </div>
        </div>

        {/* Vertical Navigation Dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                currentSlide === idx 
                  ? "w-3 h-8 bg-red-600 rounded-lg shadow-md" 
                  : "w-2.5 h-2.5 bg-slate-400 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Manual Arrows (Bottom Right) */}
        <div className="absolute bottom-20 right-6 z-20 hidden md:flex items-center gap-2">
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="p-2.5 rounded-full bg-white/80 border border-slate-300 hover:border-red-600 text-slate-800 transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-2.5 rounded-full bg-white/80 border border-slate-300 hover:border-red-600 text-slate-800 transition-all cursor-pointer shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </section>

      {/* ================= 2. THREE SIMPLE STEPS SECTION ================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-red-600">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Start Your Journey in <span className="text-red-600">Three Simple Steps</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              From inventory browsing to direct dispatch — Hualink makes regional fulfillment seamless.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-red-500/30 transition-all duration-300 relative flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    {/* Step Badge & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-red-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-red-500/20">
                        {step.number}
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                        <IconComponent size={22} />
                      </div>
                    </div>

                    {/* Step Text */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link 
                      to={step.linkUrl}
                      className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 transition-all group-hover:gap-2"
                    >
                      <span>{step.linkText}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}