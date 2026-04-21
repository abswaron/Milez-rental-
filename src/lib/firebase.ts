import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to improve connectivity in restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

/**
 * Validates connection to Firestore.
 * This is recommended for AI Studio environments to verify backend reachability.
 */
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc to trigger a server round-trip
    await getDocFromServer(doc(db, '_internal_', 'probe'));
    console.log("Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline or cannot reach the backend.");
    } else {
      console.warn("Firestore connection check produced an expected error (likely missing doc), but server was reached:", error);
    }
  }
}

testConnection();

export default app;
