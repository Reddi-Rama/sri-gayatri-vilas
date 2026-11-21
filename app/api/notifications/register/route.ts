import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";


const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

async function getAuthorizedAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization.slice(7).trim();
  if (!accessToken) return null;

  const { data: userData, error: userError } =
    await supabaseAuth.auth.getUser(accessToken);

  if (userError || !userData.user) return null;

  const { data: admin, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (adminError || !admin) return null;

  return userData.user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthorizedAdmin(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Administrator authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const token = body?.token;
    const deviceLabel = body?.deviceLabel;

    if (
      typeof token !== "string" ||
      token.length < 20 ||
      token.length > 4096
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid device token." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("admin_push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          fcm_token: token,
          device_label:
            typeof deviceLabel === "string"
              ? deviceLabel.slice(0, 100)
              : "Admin device",
          updated_at: new Date().toISOString()
        },
        { onConflict: "fcm_token" }
      );

    if (error) {
      console.error("Push device registration failed:", error.message);
      return NextResponse.json(
        { success: false, message: "Could not register this device." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push registration error:", error);
    return NextResponse.json(
      { success: false, message: "Push registration failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthorizedAdmin(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Administrator authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const token = body?.token;

    if (typeof token !== "string" || !token) {
      return NextResponse.json(
        { success: false, message: "Device token is required." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("admin_push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("fcm_token", token);

    if (error) {
      console.error("Push device removal failed:", error.message);
      return NextResponse.json(
        { success: false, message: "Could not remove this device." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push device removal error:", error);
    return NextResponse.json(
      { success: false, message: "Device removal failed." },
      { status: 500 }
    );
  }
}
