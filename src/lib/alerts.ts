import "server-only";
import { getSettings } from "./settings";

export interface LeadAlertPayload {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  service?: string | null;
  goal?: string | null;
  source?: string | null;
  leadScore?: number | null;
  leadTier?: string | null;
  message?: string | null;
  url?: string;
}

function buildSummary(p: LeadAlertPayload): string {
  const lines = [
    `New lead: ${p.name || p.email}`,
    `Email: ${p.email}`,
  ];
  if (p.company) lines.push(`Company: ${p.company}`);
  if (p.website) lines.push(`Website: ${p.website}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.service) lines.push(`Service: ${p.service}`);
  if (p.goal) lines.push(`Goal: ${p.goal}`);
  if (p.source) lines.push(`Source: ${p.source}`);
  if (p.leadTier) lines.push(`Tier: ${p.leadTier} (${p.leadScore ?? "-"}/100)`);
  if (p.message) lines.push(`Message: ${p.message || ""}`.slice(0, 500));
  return lines.join("\n");
}

async function sendSlack(webhook: string, p: LeadAlertPayload) {
  const text = `*New lead received*\n\`\`\`${buildSummary(p)}\`\`\``;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function sendDiscord(webhook: string, p: LeadAlertPayload) {
  const content = `**New lead received**\n${buildSummary(p).split("\n").join("\n")}`;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 1990) }),
  });
}

async function sendTelegram(botToken: string, chatId: string, p: LeadAlertPayload) {
  const text = `New lead received\n${buildSummary(p)}`;
  const params = new URLSearchParams({ chat_id: chatId, text: text.slice(0, 4000) });
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
}

/** Send new-lead alerts to all configured channels (best-effort, non-blocking). */
export async function sendLeadAlerts(p: LeadAlertPayload) {
  const s = await getSettings();
  if (s["alerts.leadCreatedEnabled"] !== "true") return;

  const jobs: Promise<unknown>[] = [];
  if (s["alerts.slackWebhookUrl"]) {
    jobs.push(sendSlack(s["alerts.slackWebhookUrl"], p).catch((e) => console.error("Slack alert failed:", e)));
  }
  if (s["alerts.discordWebhookUrl"]) {
    jobs.push(sendDiscord(s["alerts.discordWebhookUrl"], p).catch((e) => console.error("Discord alert failed:", e)));
  }
  if (s["alerts.telegramBotToken"] && s["alerts.telegramChatId"]) {
    jobs.push(
      sendTelegram(s["alerts.telegramBotToken"], s["alerts.telegramChatId"], p).catch((e) =>
        console.error("Telegram alert failed:", e)
      )
    );
  }
  await Promise.allSettled(jobs);
}

/** Send a test alert to all configured channels (used by the admin test button). */
export async function sendTestAlerts(): Promise<{ sent: string[]; enabled: boolean }> {
  const s = await getSettings();
  const channels: string[] = [];
  if (!s["alerts.leadCreatedEnabled"]) {
    return { sent: [], enabled: false };
  }
  const payload: LeadAlertPayload = {
    name: "Climbix Test",
    email: "test@climbixmarketing.com",
    company: "Climbix Marketing",
    website: "https://climbixmarketing.com",
    service: "General Strategy Call",
    goal: "Verify lead alert integrations",
    source: "test-alert",
    leadScore: 80,
    leadTier: "HOT",
  };
  const jobs: Promise<unknown>[] = [];
  if (s["alerts.slackWebhookUrl"]) {
    jobs.push(sendSlack(s["alerts.slackWebhookUrl"], payload).then(() => channels.push("Slack")));
  }
  if (s["alerts.discordWebhookUrl"]) {
    jobs.push(sendDiscord(s["alerts.discordWebhookUrl"], payload).then(() => channels.push("Discord")));
  }
  if (s["alerts.telegramBotToken"] && s["alerts.telegramChatId"]) {
    jobs.push(
      sendTelegram(s["alerts.telegramBotToken"], s["alerts.telegramChatId"], payload).then(() =>
        channels.push("Telegram")
      )
    );
  }
  await Promise.allSettled(jobs);
  return { sent: channels, enabled: true };
}