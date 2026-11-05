import { tradingEnv } from "@/lib/trading/config";
import { handleCommand, log } from "@/lib/trading/engine";
import { samePhone, twiml, verifyTwilioSignature } from "@/lib/trading/sms";

/** Twilio "A message comes in" webhook. Only the owner's phone can approve trades. */
export async function POST(request: Request) {
  const env = tradingEnv();
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((v, k) => (params[k] = String(v)));

  const url = `${env.publicBaseUrl}/api/trading/sms`;
  if (!verifyTwilioSignature(url, params, request.headers.get("x-twilio-signature") ?? "")) {
    return new Response("Invalid signature", { status: 403 });
  }
  if (!samePhone(params.From ?? "", env.ownerPhone)) {
    await log("warn", `Ignored text from unknown number ending ${(params.From ?? "").slice(-4)}`);
    return twiml("This number isn't authorized.");
  }
  return twiml(await handleCommand(params.Body ?? ""));
}
