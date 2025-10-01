"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, PieChart, CreditCard, BarChart3, Sparkles, Shield, Zap } from "lucide-react"

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-8">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Your Financial Freedom Starts Here
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeIn}
              className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-tight"
            >
              Manage Your
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
                Finances Smartly
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeIn}
              className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Take control of your financial future with powerful tracking, beautiful visualizations,
              and actionable insights. All in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-accent transition-all duration-300"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap justify-center gap-8 items-center text-muted-foreground mb-20"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">AI-Powered Insights</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Track Income</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor all your income sources with detailed breakdowns and growth trends
              </p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PieChart className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Analyze Spending</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualize spending patterns with interactive charts and smart categorization
              </p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Manage Subscriptions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Never miss a payment with automatic reminders and cost analysis
              </p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3">Budget Planning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set realistic budgets and track progress with intelligent recommendations
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t backdrop-blur-sm">
        <p>&copy; 2025 FinFlow. Track your finances with confidence.</p>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
