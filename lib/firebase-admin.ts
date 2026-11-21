import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { readFileSync } from "node:fs";
import path from "node:path";

let firebaseApp: App | undefined;

export function getFirebaseAdminApp(): App {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  const serviceAccount = serviceAccountJson
    ? JSON.parse(serviceAccountJson)
    : JSON.parse(
        readFileSync(
          path.join(process.cwd(), "private", "firebase-service-account.json"),
          "utf8"
        )
      );

  if (serviceAccount.project_id !== "sri-gayatri-vilas") {
    throw new Error("Firebase project ID does not match.");
  }

  firebaseApp =
    getApps().find((app) => app.name === "sri-gayatri-vilas-admin") ??
    initializeApp(
      {
        credential: cert(serviceAccount),
      },
      "sri-gayatri-vilas-admin"
    );

  return firebaseApp;
}
