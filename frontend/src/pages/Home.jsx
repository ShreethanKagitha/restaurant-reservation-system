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
        className="relative h-[90vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('/restaurant_ambience.png')` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

        <div className="relative z-10 max-w-4xl px-6 text-center space-y-6 animate-in fade-in duration-700">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20">
            <Star className="h-3 w-3 fill-gold" /> Michelin-Guide Standard Selection
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-elegant font-bold text-white tracking-tight leading-tight">
            Reserve Your Perfect <br />
            <span className="text-gold">Dining Experience</span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-200 leading-relaxed font-sans">
            Book your table effortlessly and enjoy unforgettable moments in handpicked restaurants.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 bg-burgundy hover:bg-[#601420]">
                  Management Console
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto px-8 bg-burgundy hover:bg-[#601420]">
                    Reserve Now
                  </Button>
                </Link>
                <button
                  onClick={scrollToExplore}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 active:scale-95 transition-all text-sm cursor-pointer"
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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors cursor-pointer animate-bounce flex flex-col items-center gap-1.5"
        >
          <span className="text-xs tracking-wider uppercase opacity-80">Scroll to Explore</span>
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* 2) Explore Curated Highlights Section */}
      <div
        ref={exploreSectionRef}
        className="mx-auto max-w-7xl px-6 py-20 sm:py-24 text-left space-y-12"
      >
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-bold font-elegant text-burgundy dark:text-gold sm:text-4xl">
            Curated Culinary Galleries
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Handpicked sensory spaces designed to elevate every culinary milestone.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {curatedCategories.map((cat, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-2xl border border-burgundy/10 dark:border-gold/10 bg-white dark:bg-slate-900 shadow-sm hover-lift flex flex-col md:flex-row h-full"
            >
              <div
                className="w-full md:w-1/2 h-48 md:h-auto bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">
                    {cat.tag}
                  </span>
                  <h3 className="text-xl font-bold font-elegant text-charcoal dark:text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    {cat.description}
                  </p>
                </div>
                <Link to="/register" className="text-xs font-bold text-burgundy dark:text-gold flex items-center gap-1 hover:underline">
                  Secure Priority Seating →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3) Features highlights */}
      <div className="border-t border-burgundy/10 dark:border-gold/10 bg-cream/30 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/5 dark:border-gold/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold">
                <Calendar className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Seamless Booking</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Double-check availability dynamically and allocate seating targets instantly.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/5 dark:border-gold/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Operations Center</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Admins track live table occupancies, review timelines, and reassign tables easily.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-burgundy/5 dark:border-gold/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy dark:bg-gold/15 dark:text-gold">
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
