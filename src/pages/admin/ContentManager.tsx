import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Quote, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentManager() {
    const queryClient = useQueryClient();

    // Fetch Inspiration
    const { data: inspiration, isLoading: loadingInspiration } = useQuery({
        queryKey: ['admin_inspiration'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('daily_inspiration')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Fetch Habits Templates
    const { data: habitTemplates, isLoading: loadingHabits } = useQuery({
        queryKey: ['admin_habit_templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('habit_templates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async ({ table, id }: { table: 'daily_inspiration' | 'habit_templates', id: string }) => {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [variables.table === 'daily_inspiration' ? 'admin_inspiration' : 'admin_habit_templates'] });
            toast.success('Deleted successfully');
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-red-950 dark:text-white">Content CMS</h1>
                    <p className="text-muted-foreground mt-2 tracking-tight">Manage the spiritual and productivity library of SABR OS.</p>
                </div>
            </div>

            <Tabs defaultValue="inspiration" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="inspiration" className="rounded-xl px-8 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Inspiration
                    </TabsTrigger>
                    <TabsTrigger value="habits" className="rounded-xl px-8 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm">
                        <Target className="w-4 h-4 mr-2" />
                        Habit Templates
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inspiration" className="space-y-6">
                    <Card className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5 shadow-premium overflow-hidden">
                        <CardHeader className="border-b border-border/10 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black">Daily Inspiration Library</CardTitle>
                                    <CardDescription className="font-medium">Ayahs, Hadiths, and Wisdom Cards.</CardDescription>
                                </div>
                                <Button className="bg-[#0B5B42] hover:bg-[#0B5B42]/90 rounded-xl shadow-lg shadow-[#0B5B42]/20">
                                    <Plus className="w-4 h-4 mr-2" /> Add New
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest pl-6 text-muted-foreground">Type</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Content</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingInspiration ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-20 font-medium opacity-40 uppercase tracking-tighter">Loading wisdom...</TableCell></TableRow>
                                    ) : inspiration?.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center py-20 font-medium opacity-40 uppercase tracking-tighter">The library is empty.</TableCell></TableRow>
                                    ) : (
                                        inspiration?.map((item) => (
                                            <TableRow key={item.id} className="group hover:bg-[#0B5B42]/5 transition-colors">
                                                <TableCell className="pl-6">
                                                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none px-3 font-black text-[10px] uppercase">
                                                        {item.content_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-md">
                                                    <p className="line-clamp-2 text-sm font-medium leading-relaxed">{item.translation}</p>
                                                    <p className="text-[10px] font-black uppercase opacity-40 mt-1">{item.reference}</p>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-500" onClick={() => deleteMutation.mutate({ table: 'daily_inspiration', id: item.id })}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="habits" className="space-y-6">
                    <Card className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5 shadow-premium overflow-hidden">
                        <CardHeader className="border-b border-border/10 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black">Global Habit Templates</CardTitle>
                                    <CardDescription className="font-medium">Pre-defined habits for all users.</CardDescription>
                                </div>
                                <Button className="bg-[#0B5B42] hover:bg-[#0B5B42]/90 rounded-xl shadow-lg shadow-[#0B5B42]/20">
                                    <Plus className="w-4 h-4 mr-2" /> Create Template
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest pl-6 text-muted-foreground">Icon</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Name</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Category</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingHabits ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 font-medium opacity-40 uppercase tracking-tighter">Loading templates...</TableCell></TableRow>
                                    ) : habitTemplates?.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 font-medium opacity-40 uppercase tracking-tighter">No templates found.</TableCell></TableRow>
                                    ) : (
                                        habitTemplates?.map((template) => (
                                            <TableRow key={template.id} className="group hover:bg-[#0B5B42]/5 transition-colors">
                                                <TableCell className="pl-6">
                                                    <span className="text-xl">{template.icon}</span>
                                                </TableCell>
                                                <TableCell className="font-black text-sm uppercase tracking-tight">{template.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-black text-[10px] uppercase opacity-60">
                                                        {template.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-500" onClick={() => deleteMutation.mutate({ table: 'habit_templates', id: template.id })}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

