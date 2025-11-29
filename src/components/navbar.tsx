"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Brain,
  Library,
  BarChart3,
  TrendingUp,
  Home,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: BookOpen, label: "Library", href: "/library" },
    { icon: Library, label: "Collections", href: "/collections" },
    { icon: Brain, label: "AI", href: "/recommendations" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-transparent">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl mx-auto w-full max-w-md">
        <div className="flex items-center justify-between p-2 gap-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 min-w-0"
              >
                <Link href={item.href} className="block">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 mx-1
                      ${
                        isActive
                          ? "bg-gradient-to-br from-[#49BBBD] to-[#3aa8a9] text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:text-[#49BBBD] dark:hover:text-[#49BBBD] hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium leading-tight whitespace-nowrap">
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
