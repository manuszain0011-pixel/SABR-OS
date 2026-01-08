import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Shield } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useSupabaseData';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function AdminLayout() {
    const [open, setOpen] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const { profile, isLoading: profileLoading } = useProfile();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthReady(true);
            if (!session?.user) {
                navigate('/', { replace: true });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                navigate('/', { replace: true });
            } else if (!session?.user) {
                navigate('/', { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    // Debug logging
    useEffect(() => {
        if (authReady) {
            console.log("🔒 [ADMIN CHECK] User ID:", user?.id);
            console.log("🔒 [ADMIN CHECK] Profile Found:", profile);
            console.log("🔒 [ADMIN CHECK] Loading State:", profileLoading);
        }
    }, [authReady, user, profile, profileLoading]);

    // Loading State
    if (!authReady || profileLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-red-900/20 border-t-red-900 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-900/40">Verifying Clearance...</p>
                </div>
            </div>
        );
    }

    // Role check
    if (!profile || profile.role !== 'admin') {
        const detectedRole = profile?.role || 'None (Profile Missing)';
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-md w-full p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-3xl bg-red-900/10 flex items-center justify-center">
                            <Shield className="h-10 w-10 text-red-900" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter text-red-950 dark:text-white uppercase">Access Restricted</h2>
                        <p className="text-muted-foreground mt-2 font-medium">Your account does not have clearance for the Command Center.</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Detected Role: <span className="text-red-600">{detectedRole}</span>
                        <div className="mt-2 text-[8px] font-mono lowercase tracking-normal opacity-50 select-all">ID: {user?.id}</div>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-[#0B5B42] hover:bg-[#0B5B42]/90 rounded-2xl h-12 font-black uppercase tracking-widest shadow-xl shadow-[#0B5B42]/20"
                    >
                        Return to Safety
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background isolate">
            {/* Admin Aesthetic Background - Darker/Read */}
            <div className="fixed inset-0 z-[-1] bg-[#fdfdfd] dark:bg-[#0a0a0a]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[100px] pointer-events-none" />
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
                    <SheetContent side="left" className="p-0 w-64">
                        <AdminSidebar onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
                <h1 className="text-lg font-bold tracking-tighter text-red-900 dark:text-white">SABR ADMIN</h1>
            </header>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-50">
                <AdminSidebar />
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
