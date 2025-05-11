"use server";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { LoginInput, RegisterInput } from '@/lib/schemas';
import { redirect } from 'next/navigation';

export async function loginUser(data: LoginInput) {
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
  } catch (error: any) {
    return { error: error.message || "Failed to login." };
  }
  redirect('/dashboard');
}

export async function registerUser(data: RegisterInput) {
  if (data.password !== data.confirmPassword) {
    return { error: "Passwords do not match." };
  }
  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
  } catch (error: any) {
    return { error: error.message || "Failed to register." };
  }
  redirect('/dashboard');
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any)
  {
    return { error: error.message || "Failed to logout."};
  }
  redirect('/login');
}
