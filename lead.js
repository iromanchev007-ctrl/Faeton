/* ============================================================
   Серверная функция отправки заявки в Telegram.
   Работает на Vercel (папка /api) без дополнительной настройки.
   ============================================================

   КУДА ВСТАВИТЬ КЛЮЧ И ID:
   Не вписывайте токен прямо в код. Задайте две переменные окружения
   в панели Vercel → Settings → Environment Variables:

     TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
                           (например: 1234567890:AAH...xyz)
     TELEGRAM_CHAT_ID    — ID чата/канала/группы менеджера
                           (узнать можно у @userinfobot или @getmyid_bot)

   После добавления переменных сделайте Redeploy.

   Если хотите быстро протестировать локально/без env — можно временно
   вписать значения в FALLBACK ниже (НЕ публикуйте такой код в открытый
   репозиторий — токен утечёт).
   ============================================================ */

const FALLBACK = {
  TELEGRAM_BOT_TOKEN: "", // ← можно временно вставить токен сюда для теста
  TELEGRAM_CHAT_ID: "",   // ← можно временно вставить chat_id сюда для теста
};

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || FALLBACK.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || FALLBACK.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Telegram не настроен: добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.",
    });
  }

  // Тело запроса (Vercel парсит JSON автоматически, но подстрахуемся)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { name, phone, email, brand, model, service, comment } = body || {};

  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: "Имя и телефон обязательны." });
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
      return res.status(502).json({ ok: false, error: "Telegram API error", details: result });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Не удалось отправить сообщение." });
  }
}
