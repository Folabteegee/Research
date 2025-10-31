// "use client";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import {
//   BookOpen,
//   Search,
//   Library,
//   Brain,
//   ArrowRight,
//   GraduationCap,
// } from "lucide-react";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden w-full h-full fixed inset-0">
//       {/* Animated background elements - full bleed with no white edges */}
//       <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
//         <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//         <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
//       </div>

//       {/* Floating academic icons - edge to edge with no margins */}
//       <div className="absolute inset-0">
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute text-white/10"
//             initial={{ y: 0, rotate: 0 }}
//             animate={{
//               y: [0, -30, 0],
//               rotate: [0, 8, 0],
//             }}
//             transition={{
//               duration: 5,
//               repeat: Infinity,
//               delay: i * 0.3,
//             }}
//             style={{
//               left: `${i * 8.3}%`,
//               top: `${Math.random() * 100}%`,
//               fontSize: `${24 + Math.random() * 24}px`,
//             }}
//           >
//             <BookOpen size="1em" />
//           </motion.div>
//         ))}
//       </div>

//       <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center w-full h-full overflow-hidden">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="w-full max-w-7xl mx-auto px-4"
//         >
//           {/* Logo/Brand */}
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//             className=" mt-10 mb-5 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
//           >
//             <GraduationCap className="text-blue-300" size={24} />
//             <span className="font-semibold text-blue-200">
//               Research Companion
//             </span>
//           </motion.div>

//           {/* Main Heading */}
//           <motion.h1
//             className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.8 }}
//           >
//             Research
//             <span className="block text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
//               Reimagined
//             </span>
//           </motion.h1>

// {
//   /* Subtitle */
// }
// <motion.p
//   className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-12 max-w-4xl mx-auto"
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   transition={{ delay: 0.5, duration: 0.8 }}
// >
//   Transform your academic workflow with intelligent research management. Powered
//   by <span className="text-blue-300 font-semibold">Zotero</span> and{" "}
//   <span className="text-cyan-300 font-semibold">OpenAlex</span> APIs.
// </motion.p>;

//           {/* Feature Icons */}
//           <motion.div
//             className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.7, duration: 0.8 }}
//           >
//             {[
//               { icon: Search, label: "Discover", color: "text-blue-400" },
//               { icon: Library, label: "Organize", color: "text-cyan-400" },
//               { icon: Brain, label: "Analyze", color: "text-sky-400" },
//               { icon: BookOpen, label: "Read", color: "text-blue-400" },
//             ].map((item, index) => (
//               <motion.div
//                 key={item.label}
//                 className="flex flex-col items-center group"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-white/20 mb-2 group-hover:bg-white/20 transition-all duration-300">
//                   <item.icon
//                     className={`${item.color} group-hover:scale-110 transition-transform duration-300`}
//                     size={28}
//                   />
//                 </div>
//                 <span className="text-sm text-blue-200 font-medium">
//                   {item.label}
//                 </span>
//               </motion.div>
//             ))}
//           </motion.div>

// {
//   /* CTA Buttons */
// }
// <motion.div
//   className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full"
//   initial={{ opacity: 0, y: 20 }}
//   animate={{ opacity: 1, y: 0 }}
//   transition={{ delay: 0.9, duration: 0.8 }}
// >
//   <Link href="/auth/login" className="w-full sm:w-auto flex justify-center">
//     <motion.button
//       className="group bg-white text-slate-900 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center text-base md:text-lg"
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       Get Started
//       <ArrowRight
//         className="group-hover:translate-x-1 transition-transform duration-300"
//         size={20}
//       />
//     </motion.button>
//   </Link>

//   <Link href="/auth/signup" className="w-full sm:w-auto flex justify-center">
//     <motion.button
//       className="group bg-transparent border-2 border-white/30 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-base md:text-lg"
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       Create Account
//     </motion.button>
//   </Link>
// </motion.div>;

// {/* Trust badge */}
// <motion.div
//   className="mt-8 mb-10 text-sm md:text-base text-blue-300/70"
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   transition={{ delay: 1.1, duration: 0.8 }}
// >
//   Trusted by researchers from top institutions worldwide
// </motion.div>
//         </motion.div>
//       </main>
//     </div>
//   );
// }

"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Library,
  Brain,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen p-5 bg-[url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-no-repeat bg-cover absolute inset-0 bg-center">
      {/* Dark overlay with brightness control */}
      <div className="absolute inset-0 bg-[#49BBBD]/20  "></div>

      {/* Content container with relative positioning */}
      <div className="relative z-10">
        <div className="flex relative z-10 justify-between">
          <div className="">
            {" "}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mt-10 mb-5 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-black/20"
            >
              <GraduationCap className="text-black" size={24} />
              <span className="font-semibold text-black">
                Research Companion
              </span>
            </motion.div>
          </div>
          <div className="pt-7 items-center"></div>
        </div>
        {/* Subtitle */}
        <div className="pt-30 sm:pt-5">
          <motion.p
            className="text-2xl md:text-3xl font-extrabold text-black leading-relaxed mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Transform your academic workflow with intelligent research
            management. Powered by{" "}
            <span className="text-blue-700 font-semibold">Zotero</span> and{" "}
            <span className="text-cyan-700 font-semibold">OpenAlex</span> APIs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-row gap-3 md:gap-4 justify-center items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link
              href="/auth/login"
              className="w-full sm:w-auto flex justify-center"
            >
              <motion.button
                className="group bg-white text-slate-900 font-semibold px-5 md:px-7 py-2 md:py-3 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center text-base md:text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform duration-300"
                  size={20}
                />
              </motion.button>
            </Link>

            <Link
              href="/auth/signup"
              className="w-full sm:w-auto flex justify-center"
            >
              <motion.button
                className="group bg-transparent border-2 border-white/30 text-white font-semibold px-5 md:px-7 py-2 md:py-3 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-base md:text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            className="flex justify-center pt-20 gap-4 md:gap-8 mb-12 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              { icon: Search, label: "Discover", color: "text-blue-700" },
              { icon: Library, label: "Organize", color: "text-cyan-700" },
              { icon: Brain, label: "Analyze", color: "text-sky-700" },
              { icon: BookOpen, label: "Read", color: "text-blue-700" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="flex flex-col font-bold items-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-white/30 mb-2 group-hover:bg-white/30 transition-all duration-300">
                  <item.icon
                    className={`${item.color} group-hover:scale-110 transition-transform duration-300`}
                    size={38}
                  />
                </div>
                <span className="text-xl text-black font-bold">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Trust badge */}
        <motion.div
          className="mt-7 mb-10 text-lg font-bold flex justify-center items-center md:text-base text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          Trusted by researchers from top institutions worldwide.
        </motion.div>
      </div>
    </div>
  );
}
