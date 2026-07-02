import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is already logged in, redirect immediately to dashboard
  useEffect(() => {
    if (token && !isLoading) {
      navigate('/dashboard');
    }
  }, [token, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f7]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Animation constants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const scrollFadeInVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden relative text-left">
      {/* Top Navigation */}
      <nav className="fixed w-full top-0 left-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-margin-mobile md:px-gutter py-unit max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-2 select-none">
            <span className="material-symbols-outlined text-primary text-3xl font-variation-settings-[FILL_0]">
              search_check
            </span>
            <span className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary">
              RECOVERX
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/contact"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
            >
              Log In
            </Link>
            <Link to="/register">
              <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-black/5 cursor-pointer select-none">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-outline-variant/35 px-6 py-6 space-y-4">
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-label-md text-label-md text-on-surface-variant hover:text-primary py-2"
            >
              Contact
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-label-md text-label-md text-on-surface-variant hover:text-primary py-2"
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block"
            >
              <button className="w-full bg-primary text-on-primary py-3 rounded-full font-label-md cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 dot-pattern opacity-40 -z-10"></div>
          <div
            className="outline-circle w-[400px] h-[400px] -top-20 -left-20 opacity-20 animate-pulse"
            style={{ animationDuration: '8s' }}
          ></div>
          <div className="outline-circle w-[600px] h-[600px] -bottom-40 -right-20 opacity-10"></div>
          <div className="outline-circle w-[100px] h-[100px] top-1/3 left-1/4 opacity-30 border-secondary-container"></div>

          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid lg:grid-cols-2 items-center gap-16 w-full">
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.h1
                variants={heroItemVariants}
                className="font-display text-display mb-6 leading-tight"
              >
                Lost something on campus? We'll help you <span className="accent-orange">found</span> it.
              </motion.h1>
              <motion.p
                variants={heroItemVariants}
                className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl"
              >
                The definitive network for campus recovery. Students report lost and found items, browse verified listings, and get matched with their rightful owner in minutes.
              </motion.p>
              <motion.div variants={heroItemVariants} className="flex flex-wrap gap-4">
                <Link to="/register">
                  <button className="bg-primary text-on-primary px-10 py-4 rounded-full font-label-md text-lg transition-all hover:shadow-xl hover:-translate-y-1 active:translate-y-0 cursor-pointer select-none">
                    Get Started
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-surface border border-outline-variant text-primary px-10 py-4 rounded-full font-label-md text-lg transition-all hover:bg-surface-container cursor-pointer select-none">
                    Log In
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10 glass-card rounded-3xl p-4 shadow-2xl bg-white/70 border border-outline-variant">
                <img
                  className="w-full h-auto rounded-2xl"
                  alt="A high-fidelity minimalist UI dashboard showing a grid of lost items like a blue backpack, silver laptop, and car keys. The interface is clean, primarily white and cream with orange accents. Professional studio lighting highlights the textures of the items, giving it a tactile, premium feel."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCgt0varUEA8V3UJD0ai1YbzcS_MKwCLb_KK0lUDHNnjjN2-kxAwuf0kp7zfpi1B9_sAnHmNsV86btpNJU_11gCUx3vzmkqvzyETOaxxhfGWzZL8KDWsiYxlhIgXgCWDC5Uc4Wgoq-aAw3tU-lUAje-GjBV6S1FVsVcMRxnkNSthYmm77UozD1OhCx8QHP3BtOUhssGG9uxnmaEo_in_IKoHuTjx2RJAgDmqQpSNF-fsGjiQ56u_zGrg"
                />
              </div>

              {/* Floating UI elements */}
              <div
                className="absolute -bottom-6 -left-6 glass-card px-6 py-4 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-bounce"
                style={{ animationDuration: '4s' }}
              >
                <span className="material-symbols-outlined text-secondary-container font-variation-settings-[FILL_1]">
                  check_circle
                </span>
                <span className="font-label-md text-on-surface">Item Verified</span>
              </div>
              <div className="absolute -top-10 -right-6 glass-card px-6 py-4 rounded-2xl shadow-xl z-20 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high"></div>
                </div>
                <span className="font-label-md text-on-surface">2.4k+ Active Users</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-surface py-12 border-y border-outline-variant/30">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <motion.div
              variants={scrollFadeInVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-outline-variant/30 text-center"
            >
              <div className="py-4 px-8">
                <div className="font-display text-4xl mb-1">12,480+</div>
                <div className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs">
                  Items Reported
                </div>
              </div>
              <div className="py-4 px-8">
                <div className="font-display text-4xl mb-1">92%</div>
                <div className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs">
                  Match Rate
                </div>
              </div>
              <div className="py-4 px-8">
                <div className="font-display text-4xl mb-1">450</div>
                <div className="font-label-md text-on-surface-variant uppercase tracking-widest text-xs">
                  Active Listings
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-section-gap relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="font-label-md text-secondary-container uppercase tracking-[0.2em] mb-4 block">
                Process
              </span>
              <h2 className="font-headline-lg text-headline-lg md:text-5xl">How RECOVERX Works</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-[1px] bg-outline-variant -z-10"></div>

              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="group text-center"
              >
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full border border-outline-variant flex items-center justify-center mb-8 mx-auto transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl">assignment_late</span>
                </div>
                <div>
                  <h3 className="font-headline-md mb-3">1. Report</h3>
                  <p className="font-body-md text-on-surface-variant">
                    Quickly log a lost item or report something you've found with a photo and location.
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="group text-center"
              >
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full border border-outline-variant flex items-center justify-center mb-8 mx-auto transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl">grid_view</span>
                </div>
                <div>
                  <h3 className="font-headline-md mb-3">2. Browse</h3>
                  <p className="font-body-md text-on-surface-variant">
                    Search through categorized listings using our smart matching campus algorithm.
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="group text-center"
              >
                <div className="w-20 h-20 bg-surface-container-lowest rounded-full border border-outline-variant flex items-center justify-center mb-8 mx-auto transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl">handshake</span>
                </div>
                <div>
                  <h3 className="font-headline-md mb-3">3. Reunite</h3>
                  <p className="font-body-md text-on-surface-variant">
                    Connect securely with the owner or finder to arrange a safe handoff on campus.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Highlight */}
        <section className="py-section-gap bg-surface-container-low/50 border-t border-outline-variant/20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 min-h-[600px]">
              {/* Box 1 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-4 glass-card p-10 rounded-[32px] flex flex-col justify-end relative overflow-hidden group bg-white/70 border border-outline-variant"
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                  <span className="material-symbols-outlined text-9xl">location_on</span>
                </div>
                <h3 className="font-headline-md text-3xl mb-4">Smart Geofencing</h3>
                <p className="font-body-md text-on-surface-variant max-w-md">
                  Items are tagged to specific campus zones, making it easier to pinpoint exactly where you might have left your belongings.
                </p>
              </motion.div>

              {/* Box 2 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="md:col-span-2 bg-primary p-10 rounded-[32px] flex flex-col items-center justify-center text-center text-white"
              >
                <span className="material-symbols-outlined text-6xl mb-6 text-secondary-container">
                  verified_user
                </span>
                <h3 className="font-headline-md text-2xl mb-4">Verified EDU Access</h3>
                <p className="font-body-md opacity-80">
                  Safe, secure, and restricted to verified student email addresses.
                </p>
              </motion.div>

              {/* Box 3 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 glass-card p-10 rounded-[32px] bg-white/70 border border-outline-variant"
              >
                <span className="material-symbols-outlined text-4xl mb-6">notifications_active</span>
                <h3 className="font-headline-md text-xl mb-4">Instant Alerts</h3>
                <p className="font-body-md text-on-surface-variant">
                  Get notified immediately when an item matching your description is posted.
                </p>
              </motion.div>

              {/* Box 4 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="md:col-span-4 glass-card rounded-[32px] overflow-hidden relative border border-outline-variant"
              >
                <div className="h-full w-full relative group min-h-[250px]">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="A lifestyle photograph showing two diverse college students meeting on a sun-drenched university quad, smiling as one returns a set of car keys to the other."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsx_Gmp6-uQ0DFMEMr5155_BbCzgrqLamqT6zQqRcHx_-WR-mnptyvS-LpVky2rT_vP5r9PDlorgdvX9xoICCqcA69FMGE4jIDSPED_a2aC7QBdmwGAlc4wcicSEIirqAsjobmyKSyUD1fh2uimu47grbq3N-ed9rlzBHmzoTWnL_WOcVXdsFSZ_MZs76uyv_Xn_jYqH-_157YhbOFTFnghXL0grENpWYI5k5aEj1RvU6ME6CIfyFCBw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-10 flex flex-col justify-end">
                    <p className="text-white font-headline-md text-2xl italic">
                      "RECOVERX saved my final project when I found my lost SSD within an hour."
                    </p>
                    <p className="text-white/70 font-label-md mt-4">— Alex J., Senior CS Major</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-section-gap relative overflow-hidden border-t border-outline-variant/10">
          <div className="max-w-4xl mx-auto px-margin-mobile text-center relative z-10 space-y-6">
            <div className="dot-pattern absolute inset-0 opacity-10 -z-10"></div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-display mb-8"
            >
              Ready to get started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-body-lg text-body-lg text-on-surface-variant mb-12"
            >
              Join thousands of students making campus a little more helpful, one returned item at a time.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/register">
                <button className="bg-primary text-on-primary px-12 py-5 rounded-full font-label-md text-xl transition-all hover:shadow-2xl hover:-translate-y-2 active:translate-y-0 cursor-pointer select-none">
                  Create your account
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface pt-20 border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl font-variation-settings-[FILL_0]">
                  search_check
                </span>
                <span className="font-headline-md text-primary font-bold tracking-tighter">
                  RECOVERX
                </span>
              </div>
              <p className="font-body-md text-on-surface-variant">
                The official campus lost and found network. Reconnecting students with their belongings
                since 2024.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-label-md font-bold mb-6">Product</h4>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#how-it-works">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#stories">
                      Success Stories
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#verification">
                      Verification
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-label-md font-bold mb-6">Support</h4>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li>
                    <Link className="hover:text-primary transition-colors cursor-pointer" to="/contact">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#help">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#safety">
                      Safety Guide
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-label-md font-bold mb-6">Legal</h4>
                <ul className="space-y-4 font-body-md text-on-surface-variant">
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#terms">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#privacy">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-primary transition-colors cursor-pointer" href="#cookies">
                      Cookies
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-caption text-on-surface-variant opacity-60">
              © 2024 RECOVERX. All rights reserved.
            </p>
            {/* TODO: CreditFooter */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
