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

const auth = getAuth(app);

const loadAnalytics = async () => {
  const { getAnalytics } = await import("firebase/analytics");
  return getAnalytics(app);
};
const loadPerformance = async () => {
  const { getPerformance } = await import("firebase/performance");
  getPerformance();
};

const loadFirestore = async () => {
  const { getFirestore } = await import("firebase/firestore/lite");
  return getFirestore(app);
};
loadPerformance();
export { app, loadAnalytics, auth, loadFirestore };
