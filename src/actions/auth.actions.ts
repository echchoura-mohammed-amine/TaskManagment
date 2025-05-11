import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { LoginInput, RegisterInput } from "@/lib/schemas";

// Côté client : on ne fait pas de redirection ici
export async function loginUser(data: LoginInput) {
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to login." };
  }
}

export async function registerUser(data: RegisterInput) {
  if (data.password !== data.confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    await createUserWithEmailAndPassword(auth, data.email, data.password);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to register." };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to logout." };
  }
}
