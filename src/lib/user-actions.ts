
'use client';
import { doc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { UserConfiguration } from './types';

export function saveUserConfiguration(
    db: Firestore,
    userId: string,
    data: Partial<UserConfiguration>
) {
    if (!userId) return;
    const userConfigRef = doc(db, 'users', userId, 'userConfigurations', userId);
    setDocumentNonBlocking(userConfigRef, data, { merge: true });
}
