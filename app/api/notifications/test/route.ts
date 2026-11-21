import { NextRequest, NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: auth, error: authError } = await authClient.auth.getUser(
      authorization.slice(7)
    );

    if (authError || !auth.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { data: subscriptions, error } = await supabaseAdmin
      .from("admin_push_subscriptions")
      .select("id, fcm_token")
      .eq("user_id", auth.user.id);

    if (error) throw error;
    if (!subscriptions?.length) {
      return NextResponse.json({ success: false, message: "No registered device found" }, { status: 404 });
    }

    const messaging = getMessaging(getFirebaseAdminApp());
    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const messageId = await messaging.send({
            token: subscription.fcm_token,
            data: {
              title: "Sri Gayatri Vilas - Test Notification",
              body: "Firebase push notifications are working!",
              url: "/admin?section=Orders"
            },
            webpush: { headers: { Urgency: "high", TTL: "60" } }
          });
          return { success: true, messageId };
        } catch (err) {
          return {
            success: false,
            error: err instanceof Error ? err.message : "Firebase send failed"
          };
        }
      })
    );

    return NextResponse.json({ success: results.some(r => r.success), results });
  } catch (error) {
    console.error("Push test failed:", error);
    return NextResponse.json({ success: false, message: "Push test failed" }, { status: 500 });
  }
}
