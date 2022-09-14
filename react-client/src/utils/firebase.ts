import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRE_API_KEY,
  authDomain: import.meta.env.VITE_FIRE_AUTH_DOM,
  databaseURL: import.meta.env.VITE_FIRE_DB_URL,
  projectId: import.meta.env.VITE_FIRE_PRJ_ID,
  storageBucket: import.meta.env.VITE_FIRE_STG_BKT,
  messagingSenderId: import.meta.env.VITE_FIRE_MSG_ID,
  appId: import.meta.env.VITE_FIRE_APP_ID,
  measurementId: import.meta.env.VITE_FIRE_MESG_ID,
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const main = async () => {
  const { getPerformance } = await import("firebase/performance");
  getPerformance();
};
main();
export { app, firestore, analytics, auth };
