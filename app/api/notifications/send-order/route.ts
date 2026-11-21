import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getMessaging } from "firebase-admin/messaging";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

function validSecret(received: string | null, expected: string) {
  if (!received) return false;

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.SGV_ORDER_WEBHOOK_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { success: false, message: "Webhook configuration is missing." },
        { status: 503 }
      );
    }

    const receivedSecret = request.headers.get("x-sgv-webhook-secret");

    if (!validSecret(receivedSecret, expectedSecret)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const payload = await request.json();

    if (
      payload?.type !== "INSERT" ||
      payload?.schema !== "public" ||
      payload?.table !== "orders" ||
      !payload?.record?.id
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order event." },
        { status: 400 }
      );
    }

    const orderId = String(payload.record.id);

    const { data: subscriptions, error: subscriptionError } =
      await supabaseAdmin
        .from("admin_push_subscriptions")
        .select("id,fcm_token");

    if (subscriptionError) {
      console.error("Could not load push subscriptions:", subscriptionError.message);
      return NextResponse.json(
        { success: false, message: "Could not load registered devices." },
        { status: 500 }
      );
    }

    if (!subscriptions?.length) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No administrator devices are registered."
      });
    }

    const messaging = getMessaging(getFirebaseAdminApp());
    let successCount = 0;
    let failureCount = 0;
    const invalidSubscriptionIds: string[] = [];

    for (let index = 0; index < subscriptions.length; index += 500) {
      const batch = subscriptions.slice(index, index + 500);

      const response = await messaging.sendEachForMulticast({
        tokens: batch.map((subscription) => subscription.fcm_token),
        data: {
          title: "Sri Gayatri Vilas - New Order",
          body: "A new customer order has arrived. Open the admin portal to review it.",
          orderId,
          url: "/admin?section=Orders"
        },
        webpush: {
          headers: {
            Urgency: "high",
            TTL: "60"
          }
        }
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((result, resultIndex) => {
        if (
          !result.success &&
          (
            result.error?.code === "messaging/registration-token-not-registered" ||
            result.error?.code === "messaging/invalid-registration-token"
          )
        ) {
          invalidSubscriptionIds.push(batch[resultIndex].id);
        }
      });
    }

    if (invalidSubscriptionIds.length) {
      const { error: cleanupError } = await supabaseAdmin
        .from("admin_push_subscriptions")
        .delete()
        .in("id", invalidSubscriptionIds);

      if (cleanupError) {
        console.error("Invalid token cleanup failed:", cleanupError.message);
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      removedInvalidTokens: invalidSubscriptionIds.length
    });
  } catch (error) {
    console.error("Order push delivery failed:", error);

    return NextResponse.json(
      { success: false, message: "Push notification delivery failed." },
      { status: 500 }
    );
  }
}
