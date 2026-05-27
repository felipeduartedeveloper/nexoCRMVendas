import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface LoginMeta {
  ip?: string;
  userAgent?: string;
  when?: Date;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (host) {
      const port = Number(process.env.SMTP_PORT || 587);
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || '' }
          : undefined,
      });
    } else {
      this.logger.warn('SMTP_HOST not set — emails will be logged only.');
    }
  }

  async send(opts: { to: string; subject: string; html: string; text?: string }) {
    const from = process.env.SMTP_FROM || 'Oxlify <no-reply@oxlify.com>';
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

  // ─────────────────────────── Auth / Segurança ───────────────────────────

  /** Código OTP (verificação de e-mail OU 2FA por e-mail). */
  async sendOtp(to: string, code: string) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Seu código de verificação</h2>
      <p>Use o código abaixo para continuar. Ele expira em 10 minutos.</p>
      <p style="text-align:center;letter-spacing:8px;font-family:monospace;font-size:30px;font-weight:700;margin:20px 0">${code}</p>
      <p style="color:#64748b;font-size:13px">Se você não solicitou, ignore este e-mail.</p>
    `);
    return this.send({ to, subject: 'Oxlify — código de verificação', html, text: `Seu código: ${code}` });
  }

  async sendPasswordReset(to: string, link: string) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Recuperação de senha</h2>
      <p>Recebemos um pedido para redefinir a senha da sua conta Oxlify.</p>
      ${this.button(link, 'Redefinir senha')}
      <p style="color:#64748b;font-size:13px">O link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
    `);
    return this.send({ to, subject: 'Oxlify — recuperação de senha', html, text: `Redefina sua senha: ${link}` });
  }

  /** Confirmação após a senha ser alterada com sucesso. */
  async sendPasswordChanged(to: string, name?: string) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Senha alterada</h2>
      <p>Olá${name ? ' ' + name : ''}, a senha da sua conta Oxlify foi alterada com sucesso.</p>
      <p style="color:#64748b;font-size:13px">Se <strong>não</strong> foi você, redefina a senha imediatamente e contate o suporte.</p>
    `);
    return this.send({ to, subject: 'Oxlify — sua senha foi alterada', html });
  }

  async sendWelcome(to: string, name: string) {
    const appUrl = (process.env.APP_PUBLIC_URL || 'https://sales.oxlify.com').replace(/\/$/, '');
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Bem-vindo à Oxlify 👋</h2>
      <p>Olá ${name}, sua conta foi criada com sucesso. Tudo pronto para começar a vender melhor.</p>
      ${this.button(appUrl, 'Acessar a plataforma')}
    `);
    return this.send({ to, subject: 'Bem-vindo à Oxlify', html });
  }

  /** Alerta de novo acesso (login bem-sucedido). */
  async sendLoginAlert(to: string, meta: LoginMeta = {}) {
    const when = (meta.when ?? new Date()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Novo acesso à sua conta</h2>
      <p>Detectamos um login na sua conta Oxlify:</p>
      <ul style="color:#334155;font-size:14px;line-height:1.7">
        <li><strong>Quando:</strong> ${when}</li>
        <li><strong>IP:</strong> ${meta.ip || 'desconhecido'}</li>
        <li><strong>Dispositivo:</strong> ${meta.userAgent || 'desconhecido'}</li>
      </ul>
      <p style="color:#64748b;font-size:13px">Se foi você, pode ignorar. Caso contrário, troque sua senha.</p>
    `);
    return this.send({ to, subject: 'Oxlify — novo acesso à sua conta', html });
  }

  /** Aviso de segurança quando o 2FA é ativado ou desativado. */
  async sendTwoFactorChanged(to: string, enabled: boolean) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">2FA ${enabled ? 'ativado' : 'desativado'}</h2>
      <p>A verificação em duas etapas da sua conta Oxlify foi <strong>${enabled ? 'ativada' : 'desativada'}</strong>.</p>
      <p style="color:#64748b;font-size:13px">Se não foi você, redefina a senha e contate o suporte imediatamente.</p>
    `);
    return this.send({ to, subject: `Oxlify — 2FA ${enabled ? 'ativado' : 'desativado'}`, html });
  }

  /** Convite de novo membro: senha temporária + link de login. */
  async sendInvite(to: string, opts: { loginUrl: string; tempPassword: string; orgName?: string }) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Você foi convidado 👋</h2>
      <p>Você foi adicionado à equipe${opts.orgName ? ` <strong>${opts.orgName}</strong>` : ''} na Oxlify Vendas.</p>
      <p>Acesse com a senha temporária abaixo e <strong>troque ao entrar</strong>:</p>
      <p style="text-align:center;font-family:monospace;font-size:20px;font-weight:700;background:#f1f5f9;border-radius:8px;padding:12px;margin:16px 0">${opts.tempPassword}</p>
      ${this.button(opts.loginUrl, 'Entrar na plataforma')}
      <p style="color:#64748b;font-size:12px">Dica: se preferir, use "Esqueci minha senha" na tela de login para definir uma nova senha.</p>
    `);
    return this.send({ to, subject: 'Oxlify — convite para a equipe', html, text: `Convite Oxlify. Acesse ${opts.loginUrl} com a senha temporária: ${opts.tempPassword}` });
  }

  // ─────────────────────────── Conta ───────────────────────────

  async sendAccountDeleted(to: string, name?: string) {
    const html = this.wrap(`
      <h2 style="margin:0 0 12px;font-size:20px">Conta excluída</h2>
      <p>Olá${name ? ' ' + name : ''}, sua conta Oxlify foi excluída conforme solicitado.</p>
      <p style="color:#64748b;font-size:13px">Sentiremos sua falta. Se isso foi um engano ou não foi você, contate o suporte o quanto antes.</p>
    `);
    return this.send({ to, subject: 'Oxlify — sua conta foi excluída', html });
  }

  // ─────────────────────────── helpers ───────────────────────────

  private wrap(content: string): string {
    return `
      <div style="margin:0;padding:0;background:#eef1f6;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:32px 12px;">
          <tr><td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
              <tr><td style="padding:4px 4px 22px;">
                <img src="https://sales.oxlify.com/email-logo.png" alt="Oxlify" width="150" style="display:block;border:0;outline:none;text-decoration:none;height:auto;" />
              </td></tr>
              <tr><td style="background:#ffffff;border:1px solid #e6e9ef;border-radius:16px;padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;">
                ${content}
              </td></tr>
              <tr><td style="padding:18px 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;">
                © Oxlify · este é um e-mail automático, não responda.
              </td></tr>
            </table>
          </td></tr>
        </table>
      </div>`;
  }

  private button(url: string, label: string): string {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto;"><tr>
        <td style="background-color:#3a64ff;background-image:linear-gradient(135deg,#3a64ff,#7c5cff);border-radius:12px;">
          <a href="${url}" style="display:inline-block;padding:13px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${label}</a>
        </td>
      </tr></table>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#64748b;text-align:center;margin:0;">
        Ou copie e cole: <br /><a href="${url}" style="color:#3a64ff;word-break:break-all;">${url}</a>
      </p>`;
  }
}
