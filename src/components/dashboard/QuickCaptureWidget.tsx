import { useState } from 'react';
import { Plus, CheckSquare, FileText, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export function QuickCaptureWidget() {
  const { createTask, createNote } = useApp();
  const [todoText, setTodoText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddTodo = async () => {
    if (!todoText.trim()) return;

    setIsAddingTask(true);
    try {
      await createTask({
        title: todoText.trim(),
        status: 'todo',
        priority: 'medium',
      });
      setTodoText('');
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    try {
      await createNote({
        title: 'Quick Note',
        content: noteText.trim(),
      });
      setNoteText('');
      toast.success('Note saved!');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleTodoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTodo();
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddNote();
  };

  return (
    <div className="bento-card space-y-5">
      <div className="flex items-center gap-3">
        <div className="icon-box-sm bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold">Quick Capture</h3>
      </div>

      {/* Quick Todo */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Quick To-Do</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a quick task..."
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            onKeyDown={handleTodoKeyDown}
            className="flex-1 h-11 neumorphic-inset border-none focus-visible:ring-1"
          />
          <Button
            size="icon"
            onClick={handleAddTodo}
            disabled={!todoText.trim() || isAddingTask}
            className="h-11 w-11 rounded-xl shadow-md border-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Note */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>Quick Note</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Jot down a quick note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleNoteKeyDown}
            className="flex-1 h-11 neumorphic-inset border-none focus-visible:ring-1"
          />
          <Button
            size="icon"
            onClick={handleAddNote}
            disabled={!noteText.trim() || isAddingNote}
            className="h-11 w-11 rounded-xl shadow-md border-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
