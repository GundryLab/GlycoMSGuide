/**
 * Optional, maintainer-only. Sends the monthly tool-update digest via the Replit Gmail connector; outside Replit it prints the digest to the console instead.
 *
 * Maintainer email delivery for the tool-update checker.
 *
 * Uses the Replit Gmail connector at runtime (OAuth token fetched from the
 * connector credential proxy). If the connector is not connected — or anything
 * fails — it gracefully falls back to printing the digest to the console so the
 * job never crashes and the output is still visible in deployment logs.
 */

const GMAIL_CONNECTOR_NAME = "google-mail";

interface SendResult {
  sent: boolean;
  reason?: string;
}

async function getGmailAccessToken(): Promise<string | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!hostname || !xReplitToken) return null;

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=${GMAIL_CONNECTOR_NAME}`,
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    items?: Array<{
      settings?: {
        access_token?: string;
        oauth?: { credentials?: { access_token?: string } };
      };
    }>;
  };

  const settings = data.items?.[0]?.settings;
  return (
    settings?.access_token ??
    settings?.oauth?.credentials?.access_token ??
    null
  );
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRawMessage(to: string, subject: string, body: string): string {
  // RFC 2047 encode the subject so non-ASCII survives.
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
  const lines = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
  ];
  return toBase64Url(lines.join("\r\n"));
}

/**
 * Sends the digest email to the maintainer via Gmail. Returns { sent: false }
 * (and logs the digest) if the Gmail connector is unavailable.
 */
export async function sendMaintainerDigest(
  to: string,
  subject: string,
  body: string,
): Promise<SendResult> {
  let token: string | null = null;
  try {
    token = await getGmailAccessToken();
  } catch {
    token = null;
  }

  if (!token) {
    console.log(
      "\n[email] Gmail connector not available — printing digest instead of sending.\n",
    );
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}\n`);
    console.log(body);
    return { sent: false, reason: "gmail-not-connected" };
  }

  try {
    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: buildRawMessage(to, subject, body) }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[email] Gmail send failed (${res.status}): ${text}`);
      console.log(`\n[email] Digest that failed to send:\n${body}`);
      return { sent: false, reason: `gmail-error-${res.status}` };
    }

    return { sent: true };
  } catch (err) {
    console.error("[email] Gmail send threw:", err);
    return { sent: false, reason: "gmail-exception" };
  }
}
