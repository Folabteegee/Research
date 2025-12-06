"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(
        error.code === "auth/user-not-found"
          ? "No account found with this email address."
          : error.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(73,187,189,0.03)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4"
              onClick={() => router.push("auth/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <div className="flex justify-center mb-4">
              <div className="bg-[#49BBBD] p-3 rounded-2xl">
                <Mail className="text-white" size={24} />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-foreground">
              Reset Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                    Check Your Email!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-green-900 dark:text-green-200 mt-1">
                    {email}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-3">
                    The link will expire in 1 hour.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email?
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("auth/login")}
                  >
                    Return to Login
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#49BBBD] hover:bg-[#3aa8a9]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="auth/login"
                    className="text-sm text-[#49BBBD] hover:underline"
                  >
                    Remember your password? Log in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Need help? The reset link expires in 1 hour.</p>
          <p className="mt-1">
            Check your spam folder if you don't see the email.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
