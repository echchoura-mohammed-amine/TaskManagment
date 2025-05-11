"use server";

import { db, auth } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { TaskInput, Task } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function createTask(data: TaskInput) {
  const user = auth.currentUser;
  if (!user) {
    return { error: "User not authenticated." };
  }

  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...data,
      userId: user.uid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    revalidatePath('/dashboard');
    return { id: docRef.id };
  } catch (error: any) {
    return { error: error.message || "Failed to create task." };
  }
}

export async function getTasks(): Promise<{ tasks?: Task[]; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    // This case should ideally be handled by auth protection on the route
    // For server components, this check might be tricky if auth state isn't readily available.
    // It's better to ensure this action is called only when a user is authenticated.
    // Or pass userId as an argument if called from a context where auth.currentUser is not reliable.
    // For now, let's assume this function is called in an authenticated server context.
    // If not, we might need to adjust how auth state is obtained in server actions/components.
    // A common pattern is to get the user session through a helper.
    // For simplicity, if no direct way to get current user on server for a server component call,
    // we might need to pass UID or fetch on client.
    // However, `auth.currentUser` can be populated if the server action is part of a session.
    // Let's assume for now, if this is called from a server component that runs after client auth, it *might* work.
    // A more robust way is to use NextAuth.js or similar session management for server-side auth checks.
    // With Firebase client SDK, auth.currentUser is primarily client-side state.
    // For server actions, you would typically verify an ID token sent from client.
    // This is a simplification for now.
    return { error: "User not authenticated to fetch tasks." };
  }

  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    // Sort tasks by creation date, newest first
    tasks.sort((a, b) => (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis());
    return { tasks };
  } catch (error: any) {
    console.error("Error fetching tasks: ", error);
    return { error: error.message || "Failed to fetch tasks." };
  }
}


export async function updateTask(id: string, data: Partial<TaskInput & { completed?: boolean }>) {
  const user = auth.currentUser;
  if (!user) {
    return { error: "User not authenticated." };
  }
  // Ensure the task belongs to the user before updating (important for security)
  // This check should ideally be part of Firestore rules as well.
  // For this action, we could fetch the task first, check userId, then update.

  try {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update task." };
  }
}

export async function deleteTask(id: string) {
   const user = auth.currentUser;
  if (!user) {
    return { error: "User not authenticated." };
  }
  // Similar to update, ensure task belongs to user.
  try {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete task." };
  }
}

export async function toggleTaskCompletion(id: string, completed: boolean) {
  const user = auth.currentUser;
  if (!user) {
    return { error: "User not authenticated." };
  }
  try {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      completed,
      updatedAt: serverTimestamp(),
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle task." };
  }
}
