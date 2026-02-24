export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text?.toLowerCase().trim();
  const username = body.message?.from?.username || 'anonim';
  const fullName = `${body.message?.from?.first_name || ''} ${body.message?.from?.last_name || ''}`.trim();

  if (!chatId || !text) {
    return res.status(200).json({ status: 'ignored' });
  }

  // === Kirim log ke Google Sheets ===
  await fetch('https://script.google.com/macros/s/AKfycbxJma_HN-qH-_21oGCkbA6Yfvf77wsTBuQ5ssGtoWoE93buMcBiBg1hDmYM47C6X6LF/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      username,
      full_name: fullName,
      message: text
    })
  });

  // === Jawaban spesifik ===
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

  // === Fallback random ===
  const fallbackReplies = [
    "Oh begitu ya.",
    "Menarik! Ceritain lebih lanjut dong.",
    "Aku dengerin, terusin aja..."
  ];
  const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  await sendText(token, chatId, reply);

  return res.status(200).json({ status: 'replied-fallback' });
}

// Kirim teks biasa
async function sendText(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// Kirim tombol silsilah
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
