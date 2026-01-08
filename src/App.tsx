import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Ibadat from "./pages/Ibadat";
import Tasks from "./pages/Tasks";
import Finance from "./pages/Finance";
import Wellness from "./pages/Wellness";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import Projects from "./pages/Projects";
import Ideas from "./pages/Ideas";
import Notes from "./pages/Notes";
import Resources from "./pages/Resources";
import Books from "./pages/Books";
import Contacts from "./pages/Contacts";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";

import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManager from "./pages/admin/ContentManager";
import Announcements from "./pages/admin/Announcements";
import FeedbackReports from "./pages/admin/FeedbackReports";
import SystemHealth from "./pages/admin/SystemHealth";
import Analytics from "./pages/admin/Analytics";

import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="sabr-os-theme">
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Landing page - no layout */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />

                {/* Dashboard routes with layout */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ibadat" element={<Ibadat />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/wellness" element={<Wellness />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/ideas" element={<Ideas />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                {/* Admin Routes with Role Guard */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/content" element={<ContentManager />} />
                  <Route path="/admin/announcements" element={<Announcements />} />
                  <Route path="/admin/feedback" element={<FeedbackReports />} />
                  <Route path="/admin/health" element={<SystemHealth />} />
                  {/* Settings reuse or dedicated admin settings */}
                  <Route path="/admin/settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
