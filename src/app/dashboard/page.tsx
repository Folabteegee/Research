"use client";

import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import QuoteTicker from "@/components/Quoteticker";
import { motion } from "framer-motion";
import {
  Settings,
  Award,
  Search,
  BookOpen,
  TrendingUp,
  User,
  ArrowRight,
  Brain,
  Library,
  BarChart3,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: "Search Papers",
      description: "Find works by keyword, author, or topic using OpenAlex",
      href: "/search",
      icon: Search,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "My Library",
      description: "View and manage your Zotero collections",
      href: "/library",
      icon: BookOpen,
      color: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Explore Trends",
      description: "See trending research topics and authors",
      href: "/explore",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Research Analytics",
      description: "Analyze your reading patterns and interests",
      href: "/analytics",
      icon: BarChart3,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Collections",
      description: "Organize your research into smart collections",
      href: "/collections",
      icon: Library,
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
    },
    {
      title: "Recommendations",
      description: "Get personalized paper recommendations",
      href: "/recommendations",
      icon: Brain,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden w-full h-full fixed inset-0">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5"
            initial={{ y: 0, rotate: 0 }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            style={{
              left: `${i * 15}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Brain size={28} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen w-full h-full overflow-y-auto">
        <div className="p-6">
          {/* Quote Ticker */}
          <div className="pt-4">
            <QuoteTicker />
          </div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pt-8 gap-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20"
              >
                <User className="text-blue-300" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Welcome back,
                </h1>
                <p className="text-xl text-blue-200/80 mt-1">
                  {user?.name || "Researcher"} 👋
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Settings size={20} className="text-blue-300" />
                  <span className="text-blue-200">Settings</span>
                </motion.button>
              </Link>
              <Link href="/achievements">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Award size={20} className="text-cyan-300" />
                  <span className="text-cyan-200">Achievements</span>
                </motion.button>
              </Link>
            </div>
          </motion.header>

          {/* Main Dashboard Cards - 2 per row */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* Search Papers Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/search">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full p-6 rounded-3xl backdrop-blur-sm border border-blue-500/20 bg-blue-500/10 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Search className="text-white" size={24} />
                    </div>
                    <ArrowRight
                      className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-transform duration-300"
                      size={20}
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    Search Papers
                  </h3>
                  <p className="text-blue-200/70 leading-relaxed">
                    Find works by keyword, author, or topic using OpenAlex
                  </p>

                  <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover:w-16 transition-all duration-300" />
                </motion.div>
              </Link>
            </motion.div>

            {/* My Library Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/library">
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full p-6 rounded-3xl backdrop-blur-sm border border-purple-500/20 bg-purple-500/10 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500">
                      <BookOpen className="text-white" size={24} />
                    </div>
                    <ArrowRight
                      className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-transform duration-300"
                      size={20}
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    My Library
                  </h3>
                  <p className="text-blue-200/70 leading-relaxed">
                    View and manage your Zotero collections
                  </p>

                  <div className="mt-4 h-1 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full group-hover:w-16 transition-all duration-300" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.section>

          {/* Secondary Dashboard Cards - 3 per row */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {dashboardCards.slice(2).map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link href={card.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`h-full p-6 rounded-3xl backdrop-blur-sm border ${card.borderColor} ${card.bgColor} hover:bg-white/5 transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-2xl bg-gradient-to-r ${card.color}`}
                      >
                        <card.icon className="text-white" size={24} />
                      </div>
                      <ArrowRight
                        className="text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-transform duration-300"
                        size={20}
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-blue-200/70 leading-relaxed">
                      {card.description}
                    </p>

                    <div
                      className={`mt-4 h-1 w-12 bg-gradient-to-r ${card.color} rounded-full group-hover:w-16 transition-all duration-300`}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.section>

          {/* Recent Activity */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Recent Activity
            </h2>
            <div className="text-center py-8">
              <BookOpen className="mx-auto text-white/20 mb-3" size={48} />
              <p className="text-white/40">No recent activity</p>
              <p className="text-white/30 text-sm mt-1">
                Start exploring to see your research journey
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
