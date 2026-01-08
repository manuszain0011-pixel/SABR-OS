import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, CheckSquare, Target, Lightbulb, FileText, 
  DollarSign, Heart, Calendar, Zap, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const QUICK_ACTIONS = [
  { label: 'Task', icon: CheckSquare, color: 'bg-primary/10 text-primary', key: 'task' },
  { label: 'Goal', icon: Target, color: 'bg-gold-light text-gold', key: 'goal' },
  { label: 'Idea', icon: Lightbulb, color: 'bg-yellow-500/10 text-yellow-600', key: 'idea' },
  { label: 'Note', icon: FileText, color: 'bg-blue-500/10 text-blue-600', key: 'note' },
  { label: 'Income', icon: DollarSign, color: 'bg-green-light text-primary', key: 'income' },
  { label: 'Expense', icon: DollarSign, color: 'bg-destructive/10 text-destructive', key: 'expense' },
];

export function QuickActionsWidget() {
  const { createTask, createGoal, createIdea, createNote, createTransaction } = useApp();
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    amount: '',
    category: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = async (type: string) => {
    if (!formData.title && type !== 'income' && type !== 'expense') return;
    if ((type === 'income' || type === 'expense') && !formData.amount) return;

    setIsSubmitting(true);
    try {
      switch (type) {
        case 'task':
          await createTask({
            title: formData.title,
            description: formData.content || null,
            status: 'todo',
            priority: formData.priority,
            due_date: today,
          });
          toast.success('Task added!');
          break;

        case 'goal':
          await createGoal({
            title: formData.title,
            description: formData.content || null,
            status: 'not_started',
            priority: formData.priority,
            progress: 0,
          });
          toast.success('Goal added!');
          break;

        case 'idea':
          await createIdea({
            title: formData.title,
            description: formData.content || null,
            status: 'captured',
            priority: formData.priority,
          });
          toast.success('Idea captured!');
          break;

        case 'note':
          await createNote({
            title: formData.title,
            content: formData.content || null,
          });
          toast.success('Note saved!');
          break;

        case 'income':
        case 'expense':
          await createTransaction({
            type: type,
            amount: parseFloat(formData.amount),
            category: formData.category || 'Other',
            description: formData.title || null,
            date: today,
          });
          toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
          break;
      }

      setFormData({ title: '', content: '', amount: '', category: '', priority: 'medium' });
      setActiveDialog(null);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bento-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="icon-box-sm bg-gold-light">
          <Zap className="h-4 w-4 text-gold" />
        </div>
        <h3 className="font-semibold">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Dialog 
            key={action.key} 
            open={activeDialog === action.key} 
            onOpenChange={(open) => setActiveDialog(open ? action.key : null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-secondary/80 rounded-xl border border-transparent hover:border-border/50"
              >
                <div className={`icon-box-sm ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`icon-box-sm ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  Add {action.label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {action.key === 'income' || action.key === 'expense' ? (
                  <>
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="h-11"
                    />
                    <Input
                      placeholder="Description"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-11"
                    />
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {action.key === 'income' ? (
                          <>
                            <SelectItem value="Salary">Salary</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Investment">Investment</SelectItem>
                            <SelectItem value="Gift">Gift</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Transport">Transport</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Charity">Charity</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-11"
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-24 resize-none"
                    />
                    {(action.key === 'task' || action.key === 'goal') && (
                      <Select 
                        value={formData.priority} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}
                <Button 
                  onClick={() => handleSubmit(action.key)} 
                  className="w-full h-11 rounded-xl"
                  disabled={
                    isSubmitting ||
                    ((action.key === 'income' || action.key === 'expense') 
                      ? !formData.amount 
                      : !formData.title)
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : `Add ${action.label}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="mt-5 pt-5 border-t border-border/50">
        <p className="section-title mb-3">Quick Navigate</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Journal', path: '/wellness', icon: Heart },
            { label: 'Calendar', path: '/schedule', icon: Calendar },
            { label: 'Review', path: '/reviews', icon: BookOpen },
          ].map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className="h-8 text-xs rounded-lg hover:bg-secondary/80"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-3.5 w-3.5 mr-1.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
