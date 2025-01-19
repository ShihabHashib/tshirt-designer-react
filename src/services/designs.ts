import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { SavedDesign } from '../types/design';

export const designService = {
    async saveDesign(userId: string, designData: SavedDesign, designHash: string) {
        try {
            return await addDoc(collection(db, 'designs'), {
                userId,
                designData,
                designHash,
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error saving design:', error);
            throw new Error('Failed to save design');
        }
    },

    async getUserDesigns(userId: string) {
        try {
            const q = query(
                collection(db, 'designs'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching designs:', error);
            throw new Error('Failed to fetch designs');
        }
    }
}; 