"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Discover Research Papers",
      description:
        "Search across scholarly databases to find relevant papers, authors, and datasets with advanced filters and AI-powered relevance scoring.",
      icon: "🔍",
      capabilities: [
        "Advanced search across multiple databases",
        "AI-powered relevance scoring",
        "Smart filters and sorting",
        "Author and citation tracking",
      ],
    },
    {
      title: "Organize Your Library",
      description:
        "Maintain a personal research library with collections, tags, and notes. Import and export your research seamlessly.",
      icon: "📚",
      capabilities: [
        "Personal collections and folders",
        "Smart tagging system",
        "Notes and annotations",
        "Import/export capabilities",
      ],
    },
    {
      title: "Gamification & Achievements",
      description:
        "Earn badges, level up your research skills, and track your progress with fun challenges and milestones.",
      icon: "🎮",
      capabilities: [
        "Research achievement badges",
        "Progress tracking and levels",
        "Weekly research challenges",
        "Milestones",
      ],
    },
    {
      title: "Read & Summarize",
      description:
        "Smart reading tools with AI-generated summaries, highlights, and inline annotations to help you consume literature faster.",
      icon: "📖",
      capabilities: [
        "AI-generated paper summaries",
        "Smart highlighting tools",
        "Inline annotations",
        "Faster literature review",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-[#49BBBD] bg-clip-text text-transparent mb-6"
          >
            Powerful Research Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Everything you need to conduct groundbreaking research in one
            seamless platform
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="text-3xl">{feature.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-[#49BBBD] rounded-full"></div>
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 md:mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of researchers who are already accelerating their
            discoveries
          </p>
          <div className="flex flex-col items-center sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <motion.button
                className="group bg-gradient-to-r from-[#49BBBD] to-blue-600 text-white font-bold px-8 py-4 rounded-full hover:from-[#3aa8a9] hover:to-blue-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Today
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button
                className="group bg-white border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Existing Account
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
