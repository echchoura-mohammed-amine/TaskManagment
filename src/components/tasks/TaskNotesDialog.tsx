"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateTask } from '@/actions/task.actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const NotesSchema = z.object({
  notes: z.string().max(1000, "Notes must be 1000 characters or less.").optional(),
});
type NotesInput = z.infer<typeof NotesSchema>;

interface TaskNotesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task;
  onTaskMutated?: () => void;
}

export default function TaskNotesDialog({ isOpen, onOpenChange, task, onTaskMutated }: TaskNotesDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NotesInput>({
    resolver: zodResolver(NotesSchema),
    defaultValues: {
      notes: task.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ notes: task.notes || '' });
      setError(null);
    }
  }, [isOpen, task, form]);

  async function onSubmit(values: NotesInput) {
    setError(null);
    startTransition(async () => {
      const result = await updateTask(task.id, { notes: values.notes });
      if (result?.error) {
        setError(result.error);
        toast({
          title: 'Update Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Notes Updated',
          description: `Notes for task "${task.title}" saved.`,
        });
        onTaskMutated?.();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Notes for: {task.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your notes here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isPending ? <Loader2 className="animate-spin" /> : 'Save Notes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
