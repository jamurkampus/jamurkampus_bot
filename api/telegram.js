export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text?.toLowerCase().trim();

  if (!chatId || !text) {
    return res.status(200).json({ status: 'no valid input' });
  }

  // === Logika Balasan ===
  if (text.includes('apa kabar')) {
    await sendText(token, chatId, "Aku baik, kamu gimana?");
    return res.status(200).json({ status: 'replied-kabar' });
  }

  if (text.includes('baik')) {
    await sendText(token, chatId, "Syukurlah!");
    return res.status(200).json({ status: 'replied-baik' });
  }

  if (
    text.includes('silsilah') ||
    text.includes('keluarga') ||
    text.includes('lemuang')
  ) {
    await sendWithButton(token, chatId);
    return res.status(200).json({ status: 'replied-silsilah' });
  }

  // === Fallback ===
  const fallbackReplies = [
    "Oh begitu ya.",
    "Menarik! Ceritain lebih lanjut dong.",
    "Aku dengerin, terusin aja..."
  ];
  const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  await sendText(token, chatId, reply);

  return res.status(200).json({ status: 'replied-fallback' });
}

// Fungsi Kirim Pesan Biasa
async function sendText(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// Fungsi Kirim Inline Button
async function sendWithButton(token, chatId) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: "Klik tombol di bawah untuk melihat silsilah keluarga Lemuang:",
      reply_markup: {
        inline_keyboard: [[
          {
            text: "Lihat Silsilah Lemuang",
            url: "https://override-prime-ai.vercel.app/silsilah-lemuang/"
          }
        ]]
      }
    })
  });
}
