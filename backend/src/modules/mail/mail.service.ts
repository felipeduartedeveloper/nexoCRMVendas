import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || '' }
          : undefined,
      });
    } else {
      this.logger.warn('SMTP_HOST not set — emails will be logged only.');
    }
  }

  async send(opts: { to: string; subject: string; html: string; text?: string }) {
    const from = process.env.SMTP_FROM || 'oxlify <no-reply@oxlify.com>';
    if (!this.transporter) {
      this.logger.log(`[mail:log] to=${opts.to} subject=${opts.subject}`);
      this.logger.debug(opts.text || opts.html);
      return { mocked: true };
    }
    return this.transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
  }

  async sendOtp(to: string, code: string) {
    const subject = 'Your crmvendas verification code';
    const html = `<p>Your verification code is:</p>
      <h2 style="letter-spacing:6px;font-family:monospace">${code}</h2>
      <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>`;
    return this.send({ to, subject, html, text: `Your code: ${code}` });
  }

  async sendPasswordReset(to: string, link: string) {
    const subject = 'Reset your crmvendas password';
    const html = `<p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${link}">${link}</a></p>`;
    return this.send({ to, subject, html, text: `Reset link: ${link}` });
  }

  async sendWelcome(to: string, name: string) {
    const subject = 'Welcome to crmvendas';
    const html = `<p>Hi ${name},</p><p>Welcome aboard! Your account is ready.</p>`;
    return this.send({ to, subject, html });
  }
}
