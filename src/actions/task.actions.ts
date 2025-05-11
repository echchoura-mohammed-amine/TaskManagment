
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { TaskInput, Task } from "@/lib/types";

// Create task
export async function createTask(data: TaskInput) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return { error: "User not authenticated." };

  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...data,
      userId: user.uid,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Get tasks
export async function getTasks(): Promise<{ tasks?: Task[]; error?: string }> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return { error: "User not authenticated." };

  try {
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));
    return { tasks };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Update task
export async function updateTask(taskId: string, data: TaskInput) {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Delete task
export async function deleteTask(taskId: string) {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Toggle task completion
export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      completed,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
