"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  Search,
  Library,
  Brain,
  ArrowRight,
  Share2,
  Sparkles,
  Menu,
  Trophy,
  X,
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Users,
  Zap,
  Shield,
  Globe,
  Star,
  Rocket,
  Target,
  TrendingUp,
  Instagram,
} from "lucide-react";

// Use Framer Motion's built-in Variants type instead of custom interfaces
import type { Variants } from "framer-motion";

export default function Homepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      setIsVisible(true);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Fixed animation variants using proper Variants type
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const featureVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const staggerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Floating animation for continuous effects
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const, // Add 'as const' to fix the type
    },
  };

  // Pulse animation for attention
  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  // Bounce animation for CTAs
  const bounceAnimation = {
    animate: {
      y: [0, -5, 0],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  // Wave animation for background elements
  const waveAnimation = {
    animate: {
      x: [0, 10, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  // Background gradient data for animated gradient
  const gradientBackgrounds = [
    "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(73,187,189,0.3) 50%, rgba(0,0,0,0.4) 100%)",
    "linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(73,187,189,0.4) 50%, rgba(0,0,0,0.5) 100%)",
    "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(73,187,189,0.3) 50%, rgba(0,0,0,0.4) 100%)",
  ];

  return (
    <main className="overflow-x-hidden">
      {/* Enhanced Navigation with floating effect */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full rounded-b-2xl bg-white backdrop-blur-md px-6 md:px-8 py-4 flex justify-between items-center shadow-xl z-50 transition-all duration-300 ${
          isScrolled ? "py-3" : "py-4"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-shrink-0">
            <Image
              src="/images/gurulogo5.jpg"
              alt="guru Logo"
              width={100}
              height={100}
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 lg:gap-5">
          <Link href="/auth/login">
            <motion.button
              className="group bg-gray-100 text-slate-900 font-semibold px-5 lg:px-7 py-2 lg:py-3 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm lg:text-base"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button
              className="group bg-gradient-to-r from-[#49BBBD] to-blue-600 text-white font-semibold px-5 lg:px-7 py-2 lg:py-3 rounded-full hover:from-[#3aa8a9] hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm lg:text-base"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              Get Started Free
            </motion.button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={24} className="text-black" />
          ) : (
            <Menu size={24} className="text-black" />
          )}
        </motion.button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-xl rounded-b-2xl p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.button
                  className="w-full bg-gray-100 text-slate-900 font-semibold px-5 py-3 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.button
                  className="w-full bg-gradient-to-r from-[#49BBBD] to-blue-600 text-white font-semibold px-5 py-3 rounded-full hover:from-[#3aa8a9] hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Enhanced Hero Section with multiple animations */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 mt-12 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-blue-900/30 to-cyan-800/40"
          animate={{
            background: gradientBackgrounds,
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating background elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-cyan-400 rounded-full opacity-30"
          {...floatingAnimation}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-6 h-6 bg-blue-400 rounded-full opacity-40"
          {...floatingAnimation}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white rounded-full opacity-50"
          {...floatingAnimation}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#07f4f8] mb-6 md:mb-8 drop-shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              GURU<span className="text-blue-600">SEARCH</span>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white max-w-5xl mx-auto leading-tight md:leading-normal mb-6"
            >
              Revolutionize Your{" "}
              <motion.span
                className="text-blue-500 font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                Academic Journey
              </motion.span>{" "}
              with AI-Powered Research Excellence
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              Join researchers, students, and academics who are
              <span className="font-semibold text-cyan-700">
                {" "}
                accelerating their discoveries
              </span>{" "}
              with our intelligent research platform. From literature review to
              publication-ready insights - we&apos;ve got you covered.
            </motion.p>
          </motion.div>

          {/* Enhanced Stats with staggered animation */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto"
          >
            {[
              {
                number: "10K+",
                label: "Research Papers",
                icon: <BookOpen className="text-white" size={20} />,
              },
              {
                number: "1M+",
                label: "Citations Mapped",
                icon: <Share2 className="text-white" size={20} />,
              },
              {
                number: "500+",
                label: "Explore Papers",
                icon: <Sparkles className="text-white" size={20} />,
              },
              {
                number: "99.9%",
                label: "Uptime",
                icon: <TrendingUp className="text-white" size={20} />,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 group cursor-pointer"
              >
                <motion.div
                  className="flex justify-center mb-2"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-200 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced CTA Buttons with bounce animation */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link href="/auth/signup">
              <motion.button
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 md:px-10 py-4 md:py-5 rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-lg md:text-xl relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                {...bounceAnimation}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Zap
                  size={24}
                  className="group-hover:scale-110 transition-transform relative z-10"
                />
                <span className="relative z-10">
                  Start Your Research Journey
                </span>
                <ArrowRight
                  className="group-hover:translate-x-2 transition-transform duration-300 relative z-10"
                  size={20}
                />
              </motion.button>
            </Link>

            <Link href="/auth/login">
              <motion.button
                className="group bg-white/20 backdrop-blur-sm text-white font-semibold px-8 md:px-10 py-4 md:py-5 rounded-full hover:bg-white/30 border border-white/30 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-lg md:text-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Returning Researcher?
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges with pulse animation */}
          <motion.div
            variants={itemVariants}
            className="mt-12 mb-8 flex flex-wrap justify-center items-center gap-8 opacity-80"
          >
            {[
              { icon: <Shield size={20} />, text: "Secure & Private" },
              { icon: <Globe size={20} />, text: "Global Access" },
              { icon: <Users size={20} />, text: "Community Driven" },
            ].map((badge, index) => (
              <motion.div
                key={badge.text}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-gray-300 text-sm"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {badge.icon}
                </motion.div>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Features Section with scroll-triggered animations */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-12 md:mb-16 lg:mb-20"
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-[#49BBBD] bg-clip-text text-transparent mb-4"
              whileInView={{ scale: [0.9, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Powerful Research Tools
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Everything you need to conduct groundbreaking research in one
              seamless platform
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8"
          >
            {/* Discover Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <h3 className="text-2xl sm:text-3xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Discover
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <Brain size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Search across scholarly indexes to surface relevant papers,
                authors, and datasets. Advanced filters and relevance scoring
                help you pinpoint high-impact work quickly.
              </p>
            </motion.div>

            {/* Organize Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <h3 className="text-2xl sm:text-3xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Organize
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Library size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Maintain a personal library with collections and tags. Seamless
                import/export and smart suggestions keep your library structured
                for efficient retrieval.
              </p>
            </motion.div>

            {/* Gamification Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <h3 className="text-2xl sm:text-3xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Gamification
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Trophy size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Earn badges, level up your research skills, and track progress
                with fun challenges. Stay motivated with achievements and
                milestones.
              </p>
            </motion.div>

            {/* Read & Summarize Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <h3 className="text-xl sm:text-2xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Read & Summarize
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <BookOpen size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Smart reading tools provide highlights, AI-generated papers and
                inline annotations so you can consume literature faster and
                capture insights directly in your notes.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section with wave background */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-gradient-to-br from-[#49BBBD] to-blue-600 py-20 md:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          {...floatingAnimation}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-300/20 rounded-full"
          {...floatingAnimation}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full"
          {...waveAnimation}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8"
          >
            Ready to Transform Your Research?
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-blue-100 mb-8 md:mb-12 max-w-2xl mx-auto"
          >
            Join researchers worldwide who are already accelerating their
            discoveries with GURUSEARCH
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <Link href="/auth/signup">
              <motion.button
                className="group bg-white text-slate-900 font-bold px-8 md:px-12 py-4 md:py-5 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-lg md:text-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                {...bounceAnimation}
              >
                <Zap
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
                Start Free Today
                <ArrowRight
                  className="group-hover:translate-x-2 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>

            <Link href="/features">
              <motion.button
                className="group bg-transparent border-2 border-white text-white font-semibold px-8 md:px-12 py-4 md:py-5 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-blue-100 mt-6 text-sm"
          >
            No credit card required • Free trial
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section with updated background */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <motion.div variants={itemVariants} className="w-full lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-[#49BBBD] bg-clip-text text-transparent mb-6">
                Our Mission: Empowering Researchers Worldwide
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We exist to democratize research and make academic excellence
                accessible to everyone. By combining cutting-edge AI with
                intuitive design, we&apos;re breaking down barriers to knowledge
                discovery and accelerating scientific progress.
              </p>

              <motion.ul className="space-y-4 text-gray-700 mb-8">
                {[
                  "Surface high-impact literature across all disciplines with AI-powered recommendations",
                  "Streamline your workflow with intelligent organization and tools",
                  "Accelerate discoveries with AI-powered insights and visualization tools",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3"
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Target className="text-[#49BBBD] mt-1" size={16} />
                    </motion.div>
                    <span className="text-lg">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <Link href="/auth/signup">
                <motion.button
                  className="bg-gradient-to-r from-[#49BBBD] to-blue-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg hover:from-[#3aa8a9] hover:to-blue-700"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  {...pulseAnimation}
                >
                  Join the Research Revolution
                </motion.button>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full lg:w-1/2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80"
                  alt="Research illustration"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-slate-900 text-slate-200 mt-16 md:mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            variants={staggerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12"
          >
            {/* Brand / About */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/10 p-2 rounded-md"
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src="/images/gurulogo5.jpg"
                      alt="guru Logo"
                      width={100}
                      height={100}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain"
                    />
                  </div>
                </motion.div>
                <div>
                  <div className="text-2xl font-extrabold text-white">
                    GURUSEARCH
                  </div>
                  <div className="text-sm text-slate-300">
                    Built by Taiwo G. Afolabi
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                A research companion app designed to help students and
                researchers discover, organize, and store scholarly literature
                efficiently.
              </p>

              <div className="flex items-center gap-4">
                {[
                  {
                    icon: <Github size={20} />,
                    href: "https://github.com/folabteegee",
                  },
                  {
                    icon: <Twitter size={20} />,
                    href: "https://x.com/afolabi_ta578?t=9Wp2w1ISKya5NA8vsnPkmA&s=09",
                  },
                  {
                    icon: <Linkedin size={20} />,
                    href: "https://www.linkedin.com/in/taiwo-afolabi-b5b827227",
                  },
                  {
                    icon: <Instagram size={20} />,
                    href: "https://www.instagram.com/__taiwoafolabi?igsh=MWJ5OHQ3eTVud3d6Zw==",
                  },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors duration-300 p-2 hover:bg-slate-800 rounded-lg"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    variants={itemVariants}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact & Newsletter */}
            <motion.div variants={itemVariants}>
              <h4 className="text-white font-semibold mb-4 text-lg">
                Get in Touch
              </h4>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Have questions or feedback? I&apos;d love to hear from you about
                your research needs.
              </p>

              <div className="space-y-4 mb-6">
                <motion.div
                  className="flex items-center gap-3 text-slate-300"
                  whileHover={{ x: 5 }}
                >
                  <Mail size={16} className="text-cyan-400" />
                  <a
                    href="mailto:taiwoglory136@gmail.com"
                    className="hover:text-white transition-colors duration-300"
                  >
                    taiwoglory136@gmail.com
                  </a>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-slate-300"
                  whileHover={{ x: 5 }}
                >
                  <MapPin size={16} className="text-cyan-400" />
                  <span>Osun State, Nigeria</span>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-all duration-300 w-full"
                onClick={() => window.open("mailto:taiwoglory136@gmail.com")}
              >
                Contact Me
                <Mail size={16} />
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400"
          >
            <div className="mb-4 md:mb-0 flex items-center gap-2">
              <span>© {new Date().getFullYear()} GURUSEARCH.</span>
              <span>Built with ❤️ by Taiwo G. Afolabi</span>
            </div>

            <div className="flex items-center gap-6">
              {["Portfolio", "LinkedIn", "GitHub"].map((link) => (
                <motion.a
                  key={link}
                  href={
                    link === "GitHub"
                      ? "https://github.com/folabteegee"
                      : link === "Portfolio"
                      ? "https://taiwoafolabi.netlify.app"
                      : "https://www.linkedin.com/in/taiwo-afolabi-b5b827227"
                  }
                  target={
                    link === "GitHub" || link === "Portfolio"
                      ? "_blank"
                      : "_self"
                  }
                  rel={
                    link === "GitHub" || link === "Portfolio"
                      ? "noopener noreferrer"
                      : ""
                  }
                  className="hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </main>
  );
}
