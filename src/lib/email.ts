import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";

const ADMIN_EMAIL = "admin@climbixmarketing.com";

type EmailParams = {
  to: string;
  subject: string;
  body: string;
  type: string;
  leadId?: string;
};

// Send email by logging to database (in production, integrate with Resend/SendGrid)
// Sender name/address come from the Settings module (email.senderName / email.senderEmail)
export async function sendEmail({
  to,
  subject,
  body,
  type,
  leadId,
}: EmailParams): Promise<void> {
  try {
    let from = "noreply@climbixmarketing.com";
    try {
      const [name, address] = await Promise.all([
        getSetting("email.senderName"),
        getSetting("email.senderEmail"),
      ]);
      if (address) from = name ? `${name} <${address}>` : address;
    } catch {
      /* settings unavailable — default sender applies */
    }

    await db.emailLog.create({
      data: {
        to,
        from,
        subject,
        body,
        type,
        status: "sent",
        leadId: leadId || null,
      },
    });

    console.log(`[Email] ${type} sent to ${to}: ${subject}`);
  } catch (e) {
    console.error("Failed to send email:", e);
  }
}

// Meeting confirmation email to client
export function meetingConfirmationEmail(
  name: string,
  email: string,
  date: string,
  time: string,
  timezone: string,
  service: string,
): { subject: string; body: string } {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    subject: "Your Climbix Marketing Strategy Call is Confirmed!",
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b2c, #ffb380); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Climbix Marketing</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Visibility. Leads. Growth.</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your strategy call is confirmed! We're looking forward to discussing
            your growth goals and how we can help your business scale.
          </p>
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">📋 Call Details</h3>
            <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Timezone:</strong> ${timezone}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Topic:</strong> ${service}</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            A calendar invite with a video call link will be sent shortly. If you
            need to reschedule, just reply to this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Climbix Team<br>
              <a href="mailto:${ADMIN_EMAIL}" style="color: #ff6b2c;">${ADMIN_EMAIL}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };
}

// Lead notification email to admin
export function leadNotificationEmail(
  name: string,
  email: string,
  company: string,
  website: string,
  service: string,
  goal: string,
  source: string,
): { subject: string; body: string } {
  return {
    subject: `🔔 New Lead: ${name || email} — ${service || "General Inquiry"}`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ff6b2c; margin: 0; font-size: 22px;">New Lead Received</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="color: #4b5563; line-height: 1.6;">
            A new lead has been captured on your website. Here are the details:
          </p>
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold; width: 100px;">Name:</td><td style="padding: 8px 0; color: #1f2937;">${name || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Email:</td><td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #ff6b2c;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Company:</td><td style="padding: 8px 0; color: #1f2937;">${company || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Website:</td><td style="padding: 8px 0; color: #1f2937;">${website || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Service:</td><td style="padding: 8px 0; color: #1f2937;">${service || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Goal:</td><td style="padding: 8px 0; color: #1f2937;">${goal || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Source:</td><td style="padding: 8px 0; color: #1f2937;">${source || "—"}</td></tr>
            </table>
          </div>
          <p style="color: #4b5563;">
            <a href="#admin" style="display: inline-block; background: #ff6b2c; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View in Admin Panel →
            </a>
          </p>
        </div>
      </div>
    `,
  };
}

// Audit completion email to lead
export function auditCompleteEmail(
  name: string,
  email: string,
  website: string,
  score: number,
): { subject: string; body: string } {
  return {
    subject: `Your Growth Audit Report is Ready — Score: ${score}/100`,
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b2c, #ffb380); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Growth Audit</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name || "there"},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            We've completed your free growth audit for <strong>${website}</strong>.
            Here's your overall growth score:
          </p>
          <div style="text-align: center; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 30px; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #ff6b2c;">${score}</div>
            <div style="color: #6b7280;">out of 100</div>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Our team has analyzed your SEO, technical health, content, and competitor
            positioning. We'd love to walk you through the findings and share our
            recommendations for growth.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#top" style="display: inline-block; background: #ff6b2c; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Book Your Free Strategy Call
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>The Climbix Team
          </p>
        </div>
      </div>
    `,
  };
}
