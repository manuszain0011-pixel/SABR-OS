import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus, Users, Star, Trash2, Search, Phone, Mail, Building2, User, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CONTACT_TYPES = [
  { value: 'personal', label: 'Personal', icon: User, color: 'bg-blue-500' },
  { value: 'professional', label: 'Professional', icon: Building2, color: 'bg-primary' },
  { value: 'family', label: 'Family', icon: Heart, color: 'bg-pink-500' },
  { value: 'mentor', label: 'Mentor', icon: Star, color: 'bg-gold' },
  { value: 'other', label: 'Other', icon: Users, color: 'bg-[#0B5B42]' },
];

export default function Contacts() {
  const { contacts, createContact, updateContact, deleteContact: removeContact } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'personal',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.email || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'all' && c.relationship !== filterType) return false;
      return true;
    }).sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [contacts, search, filterType]);

  const handleAddContact = async () => {
    if (!newContact.name.trim()) return;

    await createContact({
      name: newContact.name,
      relationship: newContact.relationship,
      email: newContact.email || null,
      phone: newContact.phone || null,
      company: newContact.company || null,
      notes: newContact.notes,
      is_favorite: false,
    });

    setNewContact({ name: '', relationship: 'personal', email: '', phone: '', company: '', notes: '' });
    setIsAddOpen(false);
  };

  const toggleFavorite = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    await updateContact({ id, is_favorite: !contact.is_favorite });
  };

  const deleteContact = async (id: string) => {
    await removeContact(id);
  };

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your network</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              />
              <Select value={newContact.relationship} onValueChange={(v) => setNewContact(prev => ({ ...prev, relationship: v }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {CONTACT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Company/Organization"
                value={newContact.company}
                onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
              />
              <Textarea
                placeholder="Notes"
                value={newContact.notes}
                onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
              />
              <Button onClick={handleAddContact} className="w-full" disabled={!newContact.name.trim()}>
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {CONTACT_TYPES.map(type => {
          const count = contacts.filter(c => c.relationship === type.value).length;
          return (
            <div
              key={type.value}
              className={cn(
                "bento-card text-center",
                type.value === 'other' && "!bg-[#0B5B42] text-white"
              )}
            >
              <type.icon className={cn("h-5 w-5 mx-auto mb-2", type.value === 'other' ? "text-white/80" : "text-muted-foreground")} />
              <p className="text-2xl font-bold">{count}</p>
              <p className={cn("text-xs", type.value === 'other' ? "text-white/70" : "text-muted-foreground")}>{type.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 dev-detached-tabs !p-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-none bg-transparent focus-visible:ring-0 h-11"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CONTACT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bento-card text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No contacts found. Add your first contact!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => {
            const typeInfo = CONTACT_TYPES.find(t => t.value === contact.relationship);
            const TypeIcon = typeInfo?.icon || Users;

            return (
              <div key={contact.id} className="bento-card group">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={cn("text-white", typeInfo?.color)}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeInfo?.label}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(contact.id)}>
                      <Star className={cn("h-4 w-4", contact.is_favorite && "fill-gold text-gold")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteContact(contact.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{contact.name}</h3>
                {contact.company && (
                  <p className="text-sm text-muted-foreground mb-2">{contact.company}</p>
                )}
                <div className="space-y-1 text-sm">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
                {contact.notes && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{contact.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
