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
  FileText,
  Users,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: "Search Papers",
      description: "Find works by keyword, author, or topic using OpenAlex",
      href: "/search",
      icon: Search,
      color: "bg-[#49BBBD]",
      stats: "25K+ Papers",
    },
    {
      title: "My Library",
      description: "View and manage your Zotero collections",
      href: "/library",
      icon: BookOpen,
      color: "bg-[#49BBBD]",
      stats: "500+ Items",
    },
    {
      title: "Explore Trends",
      description: "See trending research topics and authors",
      href: "/explore",
      icon: TrendingUp,
      color: "bg-[#49BBBD]",
      stats: "50+ Trends",
    },
    {
      title: "Research Analytics",
      description: "Analyze your reading patterns and interests",
      href: "/analytics",
      icon: BarChart3,
      color: "bg-[#49BBBD]",
      stats: "15 Charts",
    },
    {
      title: "Collections",
      description: "Organize your research into smart collections",
      href: "/collections",
      icon: Library,
      color: "bg-[#49BBBD]",
      stats: "10 Collections",
    },
    {
      title: "Recommendations",
      description: "Get personalized paper recommendations",
      href: "/recommendations",
      icon: Brain,
      color: "bg-[#49BBBD]",
      stats: "AI Powered",
    },
  ];

  const stats = [
    { label: "Papers Saved", value: "0", icon: FileText, change: "+0" },
    { label: "Collections", value: "0", icon: Library, change: "+0" },
    { label: "Reading Time", value: "0h", icon: Clock, change: "+0h" },
    { label: "Collaborators", value: "0", icon: Users, change: "+0" },
  ];

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80')] text-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3840&q=80')] "></div>

      <div className="relative z-10 min-h-screen">
        <div className="p-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pt-8 gap-4"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#49BBBD] p-3 rounded-2xl shadow-lg"
                >
                  <User className="text-white" size={32} />
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    Welcome,
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    {user?.name || "Researcher"} 👋
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-200 hover:border-[#49BBBD] transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Settings size={20} className="text-gray-600" />
                    <span className="text-gray-700"></span>
                  </motion.button>
                </Link>
                <Link href="/achievements">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-gray-200 hover:border-[#49BBBD] transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Award size={20} className="text-gray-600" />
                    <span className="text-gray-700"></span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.header>

          {/* Main Dashboard Cards - 2 per row */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {dashboardCards.slice(0, 2).map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link href={card.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${card.color} shadow-md`}>
                        <card.icon className="text-white" size={24} />
                      </div>
                      <ArrowRight
                        className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                        size={20}
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      {card.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#49BBBD] font-medium">
                        {card.stats}
                      </span>
                      <div className="w-8 h-1 bg-[#49BBBD] rounded-full group-hover:w-12 transition-all duration-300" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
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
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link href={card.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${card.color} shadow-md`}>
                        <card.icon className="text-white" size={24} />
                      </div>
                      <ArrowRight
                        className="text-gray-400 group-hover:text-[#49BBBD] group-hover:translate-x-1 transition-all duration-300"
                        size={20}
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      {card.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#49BBBD] font-medium">
                        {card.stats}
                      </span>
                      <div className="w-8 h-1 bg-[#49BBBD] rounded-full group-hover:w-12 transition-all duration-300" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.section>

          {/* Recent Activity & Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">
                  Start exploring to see your research journey
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ x: 5 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#49BBBD] hover:bg-[#49BBBD]/5 transition-all duration-300"
                >
                  <Search size={20} className="text-[#49BBBD]" />
                  <span className="text-gray-700">Quick Search</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#49BBBD] hover:bg-[#49BBBD]/5 transition-all duration-300"
                >
                  <BookOpen size={20} className="text-[#49BBBD]" />
                  <span className="text-gray-700">Add New Paper</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#49BBBD] hover:bg-[#49BBBD]/5 transition-all duration-300"
                >
                  <Brain size={20} className="text-[#49BBBD]" />
                  <span className="text-gray-700">Get Recommendations</span>
                </motion.button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
