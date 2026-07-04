import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChevronDown, Calendar, Star, Compass, Award, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const exploreSectionRef = useRef(null);

  const scrollToExplore = () => {
    exploreSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sample curated dining categories for food visual representations
  const curatedCategories = [
    {
      title: 'The Chef\'s Table',
      description: 'Exclusive, intimate seating overlooking our open-hearth culinary kitchen.',
      image: '/gourmet_dish.png',
      tag: 'Fine Dining'
    },
    {
      title: 'Sommelier Vaults',
      description: 'Candlelit dining spaces paired with vintage library wines from our private cellar.',
      image: '/restaurant_ambience.png',
      tag: 'Wine Cellar'
    }
  ];

  return (
    <div className="bg-[#FFF8F0] dark:bg-[#121212] transition-colors duration-300">
      {/* 1) Premium Hero Section with Ambiance Background */}
      <div
        className="relative h-[95vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('/restaurant_ambience.png')` }}
      >
        {/* Professional gradient overlay: darker at top for nav, clear in middle, solid dark at bottom to blend seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#FFF8F0] dark:to-[#121212] pointer-events-none" />

        <div className="relative z-10 max-w-4xl px-6 text-center space-y-8 animate-slide-up delay-100">
          {/* Sleek Glassmorphism Badge */}
          <div className="flex justify-center animate-scale-in delay-200">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold bg-black/40 backdrop-blur-md border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Star className="h-3 w-3 fill-gold animate-pulse" /> Michelin-Guide Standard Selection
            </span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-elegant font-bold text-white tracking-tight leading-[1.1] drop-shadow-xl">
              Reserve Your Perfect <br />
              <span className="text-gold italic font-medium drop-shadow-2xl">Dining Experience</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-200 leading-relaxed font-light tracking-wide drop-shadow-md">
              Book your table effortlessly and enjoy unforgettable moments in our handpicked, world-class culinary establishments.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-5">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-10 h-14 bg-burgundy hover:bg-[#601420] text-white shadow-[0_8px_30px_rgb(122,30,44,0.3)] transition-all hover:-translate-y-1 text-sm tracking-wider uppercase font-bold rounded-xl">
                  Management Console
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto px-10 h-14 bg-burgundy hover:bg-[#601420] text-white shadow-[0_8px_30px_rgb(122,30,44,0.3)] transition-all hover:-translate-y-1 text-sm tracking-wider uppercase font-bold rounded-xl">
                    Reserve Now
                  </Button>
                </Link>
                <button
                  onClick={scrollToExplore}
                  className="w-full sm:w-auto px-10 h-14 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 hover:border-white/40 transition-all hover:-translate-y-1 text-sm tracking-wider uppercase cursor-pointer"
                >
                  Explore Highlights
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToExplore}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors cursor-pointer animate-bounce flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">Scroll to Explore</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* 2) Explore Curated Highlights Section */}
      <div
        ref={exploreSectionRef}
        className="mx-auto max-w-7xl px-6 py-24 sm:py-32 text-left space-y-16"
      >
        <div className="max-w-2xl space-y-4 animate-slide-up delay-200">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-burgundy dark:text-gold/80">
            Exclusive Seating
          </span>
          <h2 className="text-4xl font-bold font-elegant text-slate-900 dark:text-white sm:text-5xl leading-tight">
            Curated Culinary Galleries
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg font-light leading-relaxed">
            Handpicked sensory spaces designed to elevate every culinary milestone into an unforgettable memory.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 animate-slide-up delay-300">
          {curatedCategories.map((cat, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-3xl border border-burgundy/10 dark:border-gold/10 bg-white dark:bg-slate-900 shadow-md hover-lift hover-glow flex flex-col md:flex-row h-full"
            >
              <div className="w-full md:w-5/12 overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-[800ms] ease-out"
                  style={{ backgroundImage: `url('${cat.image}')` }}
                />
              </div>
              <div className="w-full md:w-7/12 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-gold bg-gold/5 px-2.5 py-1 rounded-full border border-gold/20">
                    {cat.tag}
                  </span>
                  <h3 className="text-2xl font-bold font-elegant text-slate-900 dark:text-white group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold group-hover:underline">
                  Secure Priority Seating <ChevronDown className="h-4 w-4 -rotate-90" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3) Features highlights */}
      <div className="border-t border-burgundy/10 dark:border-gold/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/10 dark:border-gold/10 shadow-sm hover-lift hover-glow animate-slide-up delay-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold animate-float">
                <Calendar className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Seamless Booking</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Double-check availability dynamically and allocate seating targets instantly.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/10 dark:border-gold/10 shadow-sm hover-lift hover-glow animate-slide-up delay-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold animate-float" style={{ animationDelay: '0.5s' }}>
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Operations Center</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Admins track live table occupancies, review timelines, and reassign tables easily.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/10 dark:border-gold/10 shadow-sm hover-lift hover-glow animate-slide-up delay-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold animate-float" style={{ animationDelay: '1s' }}>
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Host Priority Guards</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Strict verification layers validate capacity restraints and secure data integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
