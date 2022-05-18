import admin from "firebase-admin";
const credobj = {
    projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
};
const app = admin.initializeApp({
    credential: admin.credential.cert(credobj),
})
const db = admin.firestore(app);

export { db, admin };
