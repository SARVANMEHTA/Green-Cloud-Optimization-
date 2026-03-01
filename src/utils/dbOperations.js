import { db } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { DEMO_BUILDS, DEMO_STAGE_BREAKDOWN, DEMO_ALERTS, DEMO_PROJECTS } from './demoData';

/**
 * Seed the Firestore database with the local demo data
 * under the authenticated user's document path.
 * Path: users/{uid}/pipelines/{buildId}
 */
export async function seedDemoData(userId) {
    const batch = [];
    for (const build of DEMO_BUILDS) {
        const ref = doc(db, 'users', userId, 'pipelines', build.id);
        batch.push(setDoc(ref, {
            ...build,
            seedTimestamp: serverTimestamp()
        }));
    }
    await Promise.all(batch);
    return true;
}

/**
 * Fetch all pipeline builds for a given user
 */
export async function getUserPipelines(userId) {
    const q = query(
        collection(db, 'users', userId, 'pipelines'),
        orderBy('recordedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null; // No data found — signals caller to use demo data or seed
    }

    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Save a single pipeline result to the user's collection
 */
export async function savePipelineResult(userId, buildData) {
    const ref = doc(db, 'users', userId, 'pipelines', buildData.id);
    await setDoc(ref, {
        ...buildData,
        savedAt: serverTimestamp()
    });
}

/**
 * Delete all pipeline data for a user (reset)
 */
export async function deleteAllPipelines(userId) {
    const snapshot = await getDocs(collection(db, 'users', userId, 'pipelines'));
    const ops = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(ops);
}
