"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Brain } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#49BBBD] relative">
        <div
          className="absolute inset-0 bg-cover rounded-4xl m-10 bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[#49BBBD]/40" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Brain className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Research Companion</h1>
            <p className="text-white/90 text-lg leading-relaxed">
              Welcome back! Continue your research journey with intelligent
              tools and seamless organization.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl">
                <Brain className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Research Companion
            </h2>
            <p className="text-gray-600 mt-2">Welcome back to your research</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
              >
                <p className="text-red-600 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-[#49BBBD] hover:bg-[#3aa8a9] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight
                      className="group-hover:translate-x-1 transition-transform duration-300"
                      size={20}
                    />
                  </>
                )}
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/auth/signup"
                  className="text-[#49BBBD] hover:text-[#3aa8a9] font-semibold underline-offset-4 hover:underline transition-colors"
                >
                  Create account
                </a>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
