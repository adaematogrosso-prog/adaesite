import { SITE_SHORT_NAME } from "@/lib/constants";

type UnlockEmailParams = {
  to: string;
  unlockUrl: string;
};

export async function sendUnlockAccountEmail({ to, unlockUrl }: UnlockEmailParams) {
  const subject = `${SITE_SHORT_NAME} — Desbloqueio de conta`;
  const html = `
    <p>Olá,</p>
    <p>Sua conta na plataforma ${SITE_SHORT_NAME} foi bloqueada após várias tentativas incorretas de senha.</p>
    <p>Para desbloquear o acesso, clique no link abaixo (válido por 24 horas):</p>
    <p><a href="${unlockUrl}">${unlockUrl}</a></p>
    <p>Se você não tentou entrar, ignore este e-mail ou entre em contato com a diretoria.</p>
  `.trim();

  const text = `Desbloqueie sua conta ${SITE_SHORT_NAME}: ${unlockUrl}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? `nao-responda@adaemt.com.br`;

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY não configurada. Link de desbloqueio:",
      unlockUrl,
    );
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    console.error("[email] Falha ao enviar desbloqueio:", await response.text());
    return { sent: false };
  }

  return { sent: true };
}
