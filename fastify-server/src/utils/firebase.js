import admin from "firebase-admin";

let app
if (!admin.apps.length) {
    app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.SERVICE_ACCOUNT_PROJECT_ID,
            clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
            privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
    })
}
const db = admin.firestore(app);

export { db, admin };

