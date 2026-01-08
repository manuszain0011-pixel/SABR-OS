import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Search, Shield, Ban, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch all profiles
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin_users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    // Toggle Ban Status
    const toggleBanMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const newStatus = status === 'banned' ? 'active' : 'banned';
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            return newStatus;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_users'] });
            toast.success('User status updated');
        },
        onError: () => toast.error('Failed to update status'),
    });

    // Set Role
    const setRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: string, role: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_users'] });
            toast.success('User role updated');
        },
    });

    const filteredUsers = users?.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-red-950 dark:text-white">User Management</h1>
                    <p className="text-muted-foreground mt-2">Manage access and permissions for all registered users.</p>
                </div>
            </div>

            <Card className="border-border/50 bg-white/50 backdrop-blur-sm dark:bg-white/5">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Users Directory</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                                </TableRow>
                            ) : filteredUsers?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-red-900' : ''}>
                                                {user.role || 'user'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={user.status === 'banned' ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}>
                                                {user.status || 'active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setRoleMutation.mutate({ id: user.id, role: 'admin' })}>
                                                        <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setRoleMutation.mutate({ id: user.id, role: 'user' })}>
                                                        <Users className="mr-2 h-4 w-4" /> Remove Admin
                                                    </DropdownMenuItem>
                                                    {user.status === 'banned' ? (
                                                        <DropdownMenuItem onClick={() => toggleBanMutation.mutate({ id: user.id, status: 'banned' })}>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Activate User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => toggleBanMutation.mutate({ id: user.id, status: 'active' })} className="text-red-500">
                                                            <Ban className="mr-2 h-4 w-4" /> Ban User
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
