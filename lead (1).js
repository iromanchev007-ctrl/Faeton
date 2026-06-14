/* ============================================================
   Netlify-версия функции отправки заявки в Telegram.
   На Vercel используется /api/lead.js — этот файл нужен только
   при деплое на Netlify (вместе с netlify.toml).

   Переменные окружения (Netlify → Site settings → Environment):
     TELEGRAM_BOT_TOKEN
     TELEGRAM_CHAT_ID
   ============================================================ */

const FALLBACK = {
  TELEGRAM_BOT_TOKEN: "", // ← можно временно вставить токен для теста
  TELEGRAM_CHAT_ID: "",   // ← можно временно вставить chat_id для теста
};

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || FALLBACK.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || FALLBACK.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Telegram не настроен." }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }
  const { name, phone, email, brand, model, service, comment } = body;

  if (!name || !phone) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Имя и телефон обязательны." }) };
  }

  const lines = [
    "🚗 <b>Новая заявка с сайта «Фаэтон»</b>",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(phone)}`,
    email ? `✉️ <b>Email:</b> ${escapeHtml(email)}` : "",
    brand ? `🏷 <b>Марка:</b> ${escapeHtml(brand)}` : "",
    model ? `🔧 <b>Модель:</b> ${escapeHtml(model)}` : "",
    service ? `🛠 <b>Услуга:</b> ${escapeHtml(service)}` : "",
    comment ? `💬 <b>Комментарий:</b> ${escapeHtml(comment)}` : "",
  ].filter(Boolean);

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const result = await tg.json();
    if (!result.ok) {
      return { statusCode: 502, body: JSON.stringify({ ok: false, error: "Telegram API error" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Send failed" }) };
  }
}
