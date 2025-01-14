import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signUp: (email: string, password: string) =>
      createUserWithEmailAndPassword(auth, email, password),
    signIn: (email: string, password: string) =>
      signInWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    signInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
