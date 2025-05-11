import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string date
  completed: boolean;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
