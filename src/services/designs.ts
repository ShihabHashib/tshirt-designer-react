import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { SavedDesign } from '../types/design';

export const designService = {
    async saveDesign(userId: string, designData: SavedDesign) {
        return addDoc(collection(db, 'designs'), {
            userId,
            ...designData,
            createdAt: new Date().toISOString(),
        });
    },

    async getUserDesigns(userId: string) {
        const q = query(collection(db, 'designs'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}; 