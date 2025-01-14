import { auth, db } from '../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserData } from '../types/auth';

export const authService = {
    async login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password);
    },

    async register(email: string, password: string, userData: UserData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            ...userData,
            createdAt: new Date().toISOString(),
        });
        return userCredential;
    },

    async googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }
}; 