import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Target,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Moon,
  Heart,
  Wallet,
  Zap,
  Layout,
  Bell,
  LineChart,
  Shield,
  Sparkles,
  Clock,
  Brain,
  Layers,
  RefreshCw,
  ChevronRight,
  Star,
  Users,
  Lightbulb,
  FolderOpen,
  CalendarDays,
  TrendingUp,
  Quote,
  Check,
  Globe,
  Smartphone,
  Lock,
  Compass,
  FileText,
  MessageCircle,
  Play,
  ChevronDown,
  BookMarked,
  Dumbbell,
  PiggyBank,
  ClipboardList,
  Workflow,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on a real sign-in event (prevents weird redirects during token refresh/sign-out)
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/dashboard', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">SABR</span>
                <span className="font-bold text-xl text-primary"> OS</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-10">
              <a href="#what-is-sabr" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Modules</a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center">
              <Link to="/auth">
                <Button variant="outline" className="border-primary/30 hover:bg-primary/5">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-40 w-[500px] h-[500px] bg-accent/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-primary/3 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-light border border-primary/20 text-primary text-sm font-semibold mb-8"
            >
              <Sparkles className="w-4 h-4" />
              The Life Operating System for Muslims
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={fadeIn}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8"
            >
              Master Your Life.
              <span className="block mt-3 text-gradient">Dunya & Akhira.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={fadeIn}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              One powerful dashboard to organize your spiritual growth, personal goals, 
              finances, projects, wellness, and everything that matters. 
              Built for Muslims who want to live intentionally.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gradient-green text-primary-foreground px-10 h-14 text-lg shadow-xl hover:shadow-2xl transition-all">
                  Start For Free
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <a href="#what-is-sabr">
                <Button size="lg" variant="outline" className="px-10 h-14 text-lg border-2">
                  Learn More
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </motion.div>

            <motion.p variants={fadeIn} className="text-sm text-muted-foreground">
              No credit card required • Free forever for core features
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What is SABR OS Section */}
      <section id="what-is-sabr" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">About SABR OS</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 leading-tight">
                What is <span className="text-gradient">SABR OS</span>?
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">SABR OS</strong> is your personal life operating system — a unified platform 
                  designed to help you manage every important area of your life from one clean, beautiful interface.
                </p>
                <p>
                  Instead of juggling multiple apps for habits, goals, finances, notes, and spiritual tracking, 
                  SABR OS brings everything together in one place. It's built specifically for Muslims who want 
                  to excel in both their worldly responsibilities and spiritual growth.
                </p>
                <p>
                  The name <strong className="text-foreground">SABR (صَبْر)</strong> means patience in Arabic — 
                  reflecting our core philosophy that meaningful transformation comes through consistent, patient 
                  effort over time, not quick fixes.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                {["All-in-One", "Muslim-Focused", "Privacy First", "Always Free Core"].map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-green-light text-primary text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Features List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {[
                {
                  icon: Compass,
                  title: "Life Dashboard",
                  description: "See your entire life at a glance — goals, tasks, habits, spiritual practices, finances, and more in one unified view."
                },
                {
                  icon: Moon,
                  title: "Spiritual Integration",
                  description: "Track your Ibadat, prayer consistency, Quran reading, and spiritual goals alongside your worldly pursuits."
                },
                {
                  icon: BarChart3,
                  title: "Progress Insights",
                  description: "Visual analytics and charts help you understand your patterns and celebrate your consistent growth."
                },
                {
                  icon: Calendar,
                  title: "Review System",
                  description: "Built-in daily, weekly, and monthly review templates to reflect, plan, and stay aligned with your purpose."
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="w-14 h-14 rounded-xl gradient-green flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <span className="text-sm font-semibold text-destructive uppercase tracking-wider">The Problem</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              Life Feels Scattered and Overwhelming
            </h2>
            <p className="text-xl text-muted-foreground">
              You're trying to grow spiritually, advance your career, manage finances, build habits, 
              and maintain relationships — but everything is spread across different apps and notebooks.
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Layers,
                title: "Too Many Apps",
                description: "Habit tracker here, notes there, finance app somewhere else. Constant context switching drains your energy."
              },
              {
                icon: Brain,
                title: "Mental Overload",
                description: "Trying to remember everything manually. Important things slip through the cracks."
              },
              {
                icon: Clock,
                title: "No Big Picture",
                description: "Hard to see how different areas of life connect. You lose sight of your overall direction."
              },
              {
                icon: TrendingUp,
                title: "Lost Progress",
                description: "When data is scattered, you can't see patterns or celebrate how far you've come."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="p-8 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-light border border-primary/20">
              <Zap className="w-6 h-6 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                SABR OS solves this by bringing <span className="text-primary">everything into one unified system</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Complete Life System</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              9 Powerful Modules. One System.
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Each module is carefully designed to help you manage a specific area of life. 
              Together, they form a complete operating system for intentional living.
            </p>
          </motion.div>

          {/* Modules Grid */}
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Moon,
                title: "Ibadat Tracker",
                description: "Track your daily prayers, Quran reading goals, dhikr, fasting, and all spiritual practices. See your consistency patterns and build lasting worship habits.",
                color: "from-primary to-primary/80"
              },
              {
                icon: Target,
                title: "Goals",
                description: "Set meaningful short-term and long-term goals across all areas of life. Break them into milestones, track progress, and achieve what matters most.",
                color: "from-primary to-primary/80"
              },
              {
                icon: FolderOpen,
                title: "Projects",
                description: "Manage personal and professional projects with task breakdowns, deadlines, status tracking, and clear organization for everything you're working on.",
                color: "from-primary to-primary/80"
              },
              {
                icon: ClipboardList,
                title: "Tasks & Habits",
                description: "Your daily command center. Prioritize tasks, build lasting habits with streak tracking, and never lose track of what needs to be done.",
                color: "from-primary to-primary/80"
              },
              {
                icon: PiggyBank,
                title: "Finance Manager",
                description: "Track income, expenses, savings goals, budgets, and investments. Get a clear picture of your financial health and work toward financial freedom.",
                color: "from-accent to-accent/80"
              },
              {
                icon: Dumbbell,
                title: "Wellness",
                description: "Monitor physical health, mental wellbeing, sleep quality, exercise routines, and nutrition. A holistic view of your body and mind.",
                color: "from-primary to-primary/80"
              },
              {
                icon: BookMarked,
                title: "Books & Learning",
                description: "Maintain your reading list, track books in progress, save key takeaways, and organize all your learning resources in one place.",
                color: "from-primary to-primary/80"
              },
              {
                icon: Lightbulb,
                title: "Ideas & Notes",
                description: "Capture ideas as they come. Organize notes, journal entries, reflections, and thoughts in a structured, searchable system.",
                color: "from-accent to-accent/80"
              },
              {
                icon: Users,
                title: "Contacts & Network",
                description: "Keep track of important relationships, meeting notes, follow-up reminders, and stay connected with people who matter.",
                color: "from-primary to-primary/80"
              }
            ].map((module, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <module.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{module.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{module.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why SABR OS</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              Built for How You Actually Live
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed to reduce friction and help you stay organized without 
              adding complexity to your life.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {[
                {
                  icon: Layout,
                  title: "Unified Dashboard",
                  description: "Stop switching between apps. Your goals, tasks, finances, ibadat, and notes — all accessible from one clean interface. See your entire life at a glance."
                },
                {
                  icon: LineChart,
                  title: "Progress Analytics",
                  description: "Beautiful charts and insights that reveal your patterns. Celebrate consistency, identify what's working, and make data-informed decisions about your life."
                },
                {
                  icon: CalendarDays,
                  title: "Review System",
                  description: "Built-in daily check-ins, weekly reviews, and monthly reflections. Stay aligned with your purpose and continuously improve your approach."
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-14 h-14 rounded-xl bg-green-light flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {[
                {
                  icon: Zap,
                  title: "Quick Capture",
                  description: "Add tasks, notes, expenses, or ideas in seconds. Quick-action buttons throughout the app mean you never lose a thought. Capture now, organize later."
                },
                {
                  icon: Smartphone,
                  title: "Works Everywhere",
                  description: "Fully responsive design works beautifully on phones, tablets, and desktops. Access your life system from any device, anywhere in the world."
                },
                {
                  icon: Shield,
                  title: "Privacy Focused",
                  description: "Your personal data stays private. No selling information to advertisers, no invasive tracking. Just a tool that works for you, not against you."
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-6">
                  <div className="w-14 h-14 rounded-xl bg-gold-light flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Islamic Values Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Philosophy</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              Rooted in <span className="text-gradient">Islamic Values</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              SABR OS is built on principles that align with the Muslim way of life — 
              balancing worldly success with spiritual growth.
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                arabic: "صَبْر",
                english: "Sabr (Patience)",
                description: "Meaningful transformation takes time. This system is designed for consistent, patient effort — not quick fixes or shortcuts."
              },
              {
                arabic: "تَقْوَى",
                english: "Taqwa (God-Consciousness)",
                description: "Keep your spiritual goals at the center of your life, alongside worldly responsibilities. Never lose sight of your ultimate purpose."
              },
              {
                arabic: "إِتْقَان",
                english: "Itqan (Excellence)",
                description: "Strive for excellence in everything you do — your worship, your work, your relationships, and your personal growth."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="text-center p-10 rounded-3xl bg-card border border-border"
              >
                <div className="text-5xl font-bold text-primary mb-4 font-serif">{value.arabic}</div>
                <h3 className="font-bold text-xl text-foreground mb-4">{value.english}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Getting Started</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              How SABR OS Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Getting started is simple. In just a few steps, you'll have a complete life management 
              system ready to use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up for free in seconds. No credit card required. Your personal dashboard is ready immediately."
              },
              {
                step: "02",
                title: "Choose Your Modules",
                description: "Select which areas of life you want to focus on. Start with one or enable all nine — it's your choice."
              },
              {
                step: "03",
                title: "Add Your Data",
                description: "Input your goals, habits, tasks, and other information. The dashboard organizes everything automatically."
              },
              {
                step: "04",
                title: "Track & Grow",
                description: "Use daily check-ins and reviews to stay on track. Watch your progress over time and celebrate your growth."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/40 to-transparent -translate-x-8" />
                )}
                <div className="relative p-8 rounded-2xl border border-border bg-card h-full">
                  <div className="text-6xl font-bold text-primary/10 absolute top-4 right-6">{item.step}</div>
                  <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center mb-6">
                    <span className="text-primary-foreground font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Perfect For</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              Who Is SABR OS For?
            </h2>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Ambitious Professionals",
                description: "You have career goals, side projects, and endless responsibilities. You need a system to keep it all organized without dropping balls."
              },
              {
                title: "Students & Lifelong Learners",
                description: "Balance studies, personal development, and spiritual growth. Track your learning, build good habits, and stay focused on your goals."
              },
              {
                title: "Entrepreneurs & Freelancers",
                description: "Manage multiple projects, track finances, and maintain work-life balance. Keep your business and personal life in harmony."
              },
              {
                title: "Parents & Family Leaders",
                description: "Juggle family responsibilities, personal goals, and household management. Stay organized while being present for what matters most."
              },
              {
                title: "Spiritual Seekers",
                description: "Deepen your connection with Allah through consistent worship tracking, Quran goals, and spiritual reflection alongside daily life."
              },
              {
                title: "Anyone Seeking Structure",
                description: "If life feels chaotic and you want a clear system to organize your thoughts, goals, and daily activities — this is for you."
              }
            ].map((persona, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="p-8 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-green-light flex items-center justify-center mb-6">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{persona.title}</h3>
                <p className="text-muted-foreground">{persona.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {[
              {
                question: "Is SABR OS free to use?",
                answer: "Yes! SABR OS offers a generous free tier with all core features. You can use the complete life management system without paying anything. Premium features for power users may be available in the future, but the core experience will always be free."
              },
              {
                question: "Do I need any technical skills to use it?",
                answer: "Not at all. SABR OS is designed to be intuitive and user-friendly. If you can use a smartphone or browse the web, you can use SABR OS. Everything is point-and-click with a clean, simple interface."
              },
              {
                question: "Can I use it on my phone?",
                answer: "Absolutely. SABR OS is fully responsive and works beautifully on phones, tablets, and desktop computers. You can access your dashboard from any device with a web browser."
              },
              {
                question: "Is my data private and secure?",
                answer: "Yes. Your data is encrypted and stored securely. We don't sell your data, share it with advertisers, or use it for anything other than providing you with the service. Privacy is a core principle of SABR OS."
              },
              {
                question: "What makes SABR OS different from other productivity apps?",
                answer: "Most apps focus on just one thing — habits, notes, finances, or tasks. SABR OS is designed as a complete life operating system that brings everything together. Plus, it's built specifically with Muslim users in mind, integrating spiritual tracking alongside worldly pursuits."
              },
              {
                question: "Can I customize which modules I use?",
                answer: "Yes! You can enable or disable any module based on your needs. Want to start with just Ibadat and Goals? Go for it. You can always add more modules later as you get comfortable with the system."
              },
              {
                question: "What does SABR mean?",
                answer: "SABR (صَبْر) is Arabic for patience — a fundamental virtue in Islam. The name reflects our philosophy: meaningful growth happens through consistent, patient effort over time, not quick fixes or overnight transformations."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-2xl overflow-hidden bg-card"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-lg text-foreground">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 gradient-green opacity-95" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Take Control of Your Life?
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
                Join thousands of Muslims using SABR OS to organize their lives, 
                achieve their goals, and grow closer to Allah.
              </p>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="px-12 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all">
                  Start Using SABR OS — It's Free
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <p className="mt-6 text-primary-foreground/60 text-sm">
                No credit card required. Free forever for core features.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">SABR</span>
                <span className="font-bold text-xl text-primary"> OS</span>
              </div>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-8">
              <a href="#what-is-sabr" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Modules</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>

            <p className="text-sm text-muted-foreground">
              © 2024 SABR OS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
