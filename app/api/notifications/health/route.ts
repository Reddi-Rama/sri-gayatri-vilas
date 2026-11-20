import { getFirebaseAdminApp } from "@/lib/firebase-admin";


export async function GET() {
  try {
    const app = getFirebaseAdminApp();

    return Response.json({
      success: true,
      firebaseInitialized: true,
      projectId: app.options.projectId,
      message: "Firebase Admin SDK is ready.",
    });
  } catch {
    return Response.json(
      {
        success: false,
        firebaseInitialized: false,
        message: "Firebase initialization failed. Check server credentials.",
      },
      { status: 503 }
    );
  }
}

