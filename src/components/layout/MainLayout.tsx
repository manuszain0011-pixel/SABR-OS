import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect to Landing on an actual sign-out (avoids false positives)
      if (event === 'SIGNED_OUT') {
        navigate('/', { replace: true });
        return;
      }

      // Safety: if session becomes null for any reason while in the app shell
      if (!session?.user) {
        navigate('/', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthReady(true);
      if (!session?.user) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Avoid a flash of dashboard content before auth is checked
  if (!authReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#0B5B42]/20 border-t-[#0B5B42] rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B5B42]/40">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background isolate">
      {/* Premium Aesthetic Background */}
      <div className="premium-bg">
        <div className="premium-bg-blob top-[-10%] left-[-10%] bg-primary" />
        <div className="premium-bg-blob bottom-[-10%] right-[-10%] bg-gold" />
        <div className="noise-overlay" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none h-full">
            <Sidebar onNavigate={() => setOpen(false)} className="border-none shadow-none h-full" />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold tracking-tighter text-gradient-premium">SABR OS</h1>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative z-50">
        <Sidebar className="fixed left-0 top-0 w-72 h-screen" />
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 pt-14 lg:pt-0">
        <div className="container max-w-[1440px] py-6 px-4 lg:py-12 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
