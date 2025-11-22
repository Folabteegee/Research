"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Library,
  Brain,
  ArrowRight,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

export default function Homepage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
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

  const featureVariants = {
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

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <main className="overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full rounded-b-2xl bg-white p-4 md:p-8 flex justify-between items-center shadow-2xl z-50 transition-all duration-300 ${
          isScrolled ? "py-3 md:py-6" : "py-4 md:py-8"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl md:text-3xl font-extrabold text-black"
        >
          RESEARCHH
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 lg:gap-5">
          <Link href="/auth/login">
            <motion.button
              className="group bg-gray-100 text-slate-900 font-semibold px-5 lg:px-7 py-2 lg:py-3 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm lg:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button
              className="group bg-gray-100 text-slate-900 font-semibold px-5 lg:px-7 py-2 lg:py-3 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm lg:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Account
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
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-2xl p-6 md:hidden"
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
                  className="w-full bg-gray-100 text-slate-900 font-semibold px-5 py-3 rounded-full hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Account
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#07f4f8] mb-6 md:mb-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              RESEARCHH
            </motion.div>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white max-w-4xl mx-auto leading-tight md:leading-normal"
              variants={itemVariants}
            >
              Transform your{" "}
              <span className="text-blue-300 font-semibold">Academic</span>{" "}
              workflow with intelligent{" "}
              <span className="text-cyan-300 font-semibold">
                Research Management.
              </span>
            </motion.p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-5"
            variants={itemVariants}
          >
            <Link href="/auth/login">
              <motion.button
                className="group bg-white text-slate-900 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-base md:text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>

            <Link href="/auth/signup">
              <motion.button
                className="group bg-white text-slate-900 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-base md:text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="bg-white py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-12 md:mb-16 lg:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Our Programs
            </h2>
          </motion.div>

          <motion.div
            variants={staggerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8"
          >
            {/* Discover Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl sm:text-3xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Discover
                <motion.div
                  whileHover={{ rotate: 360 }}
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
              className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
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
                Maintain a personal library with collections, tags, and notes.
                Seamless import/export and smart suggestions keep your library
                structured for efficient retrieval.
              </p>
            </motion.div>

            {/* Analyze Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl sm:text-3xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Analyze
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Search size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Extract key metrics, citation trends, and co‑authorship
                networks. Built‑in visualizations and summaries help you spot
                gaps and emerging topics.
              </p>
            </motion.div>

            {/* Read & Summarize Feature */}
            <motion.div
              variants={featureVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-xl sm:text-2xl text-[#49BBBD] font-bold mb-4 flex items-center gap-3">
                Read & Summarize
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <BookOpen size={28} />
                </motion.div>
              </h3>
              <p className="text-sm sm:text-base font-normal text-gray-700 leading-relaxed">
                Smart reading tools provide highlights, AI-generated papers, and
                inline annotations so you can consume literature faster and
                capture insights directly in your notes.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-[#49BBBD] py-36 md:py-28 lg:py-36 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 md:mb-12"
          >
            Make your Research Easier!
          </motion.h2>

          <motion.div variants={itemVariants}>
            <Link href="/auth/signup">
              <motion.button
                className="group bg-white text-slate-900 font-semibold px-8 md:px-10 py-3 md:py-4 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl mx-auto text-base md:text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="max-w-7xl mx-auto py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <motion.div variants={itemVariants} className="w-full lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We exist to make research faster, clearer, and more connected. By
              combining open scholarly data with smart workflows and seamless
              Zotero integration, we help researchers find relevant work,
              organize it effortlessly, and turn insights into impact.
            </p>

            <motion.ul className="space-y-4 text-gray-700 mb-8">
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="mt-1 text-[#49BBBD] font-bold text-lg">•</span>
                <span className="text-lg">
                  Surface high-impact literature across disciplines.
                </span>
              </motion.li>
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="mt-1 text-[#49BBBD] font-bold text-lg">•</span>
                <span className="text-lg">
                  Keep your library organized and interoperable with Zotero.
                </span>
              </motion.li>
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="mt-1 text-[#49BBBD] font-bold text-lg">•</span>
                <span className="text-lg">
                  Provide AI-powered summaries and visual insights.
                </span>
              </motion.li>
            </motion.ul>

            <Link href="/auth/signup">
              <motion.button
                className="bg-[#49BBBD] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          >
            {/* Brand / About */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-md">
                  <GraduationCap className="text-cyan-300" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">
                    RESEARCHH
                  </div>
                  <div className="text-sm text-slate-300">
                    Smarter research workflows, Zotero + OpenAlex powered
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                RESEARCHH helps researchers discover, organize, and summarize
                scholarly literature. Privacy-focused, open-data friendly, and
                tailored for academic workflows.
              </p>

              <div className="flex items-center gap-4">
                {["GitHub", "Twitter", "LinkedIn"].map((platform) => (
                  <motion.a
                    key={platform}
                    href={`https://${platform.toLowerCase()}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white text-sm transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {platform}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-white font-semibold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-sm text-slate-300">
                {["Discover", "Organize", "Analyze", "Read & Summarize"].map(
                  (link) => (
                    <motion.li key={link} whileHover={{ x: 5 }}>
                      <a
                        href={`/${link.toLowerCase().replace(" & ", "-")}`}
                        className="hover:text-white transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </motion.li>
                  )
                )}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div variants={itemVariants}>
              <h4 className="text-white font-semibold mb-4 text-lg">
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                {["Documentation", "Pricing", "Support", "Blog"].map((link) => (
                  <motion.li key={link} whileHover={{ x: 5 }}>
                    <a
                      href={`/${link.toLowerCase()}`}
                      className="hover:text-white transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact & Newsletter */}
            <motion.div variants={itemVariants}>
              <h4 className="text-white font-semibold mb-4 text-lg">
                Stay in the loop
              </h4>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Join our newsletter for product updates, research tips, and
                release notes.
              </p>

              <form
                className="flex flex-col gap-3 mb-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="you@university.edu"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-all duration-300"
                >
                  Subscribe
                  <ArrowRight size={16} />
                </motion.button>
              </form>

              <div className="text-sm text-slate-400 space-y-2">
                <div>
                  Contact:{" "}
                  <a
                    href="mailto:hello@researchh.example"
                    className="text-slate-200 hover:underline transition-colors duration-300"
                  >
                    hello@researchh.example
                  </a>
                </div>
                <div>
                  Office:{" "}
                  <span className="text-slate-300">123 Academic Way, City</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400"
          >
            <div className="mb-4 md:mb-0">
              © {new Date().getFullYear()} RESEARCHH. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              {["Terms", "Privacy", "Contact"].map((link) => (
                <motion.a
                  key={link}
                  href={`/${link.toLowerCase()}`}
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
