/** Twilio SMS: send texts and verify that inbound webhooks really came from Twilio. */
import crypto from "node:crypto";
import { smsConfigured, tradingEnv } from "./config";

export async function sendText(body: string): Promise<{ sent: boolean; error?: string }> {
  if (!smsConfigured()) return { sent: false, error: "Twilio not configured" };
  const env = tradingEnv();
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.twilioSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${env.twilioSid}:${env.twilioToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: env.ownerPhone, From: env.twilioFrom, Body: body }),
    }
  );
  if (!res.ok) return { sent: false, error: `Twilio ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { sent: true };
}

/**
 * Twilio signs each webhook: HMAC-SHA1(authToken, url + sorted(key+value)), base64.
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export function verifyTwilioSignature(url: string, params: Record<string, string>, signature: string) {
  const env = tradingEnv();
  if (!env.twilioToken || !signature) return false;
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join("");
  const expected = crypto.createHmac("sha1", env.twilioToken).update(data).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Normalize "+1 (555) 123-4567" and "5551234567" to comparable digits. */
export function samePhone(a: string, b: string) {
  const d = (s: string) => s.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d(a) !== "" && d(a) === d(b);
}

export function twiml(message: string) {
  const esc = message.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc}</Message></Response>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
