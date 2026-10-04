const { del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, password } = req.body || {};

    const validPassword = process.env.ADMIN_PASSWORD || 'bilgehan2411';
    if (password !== validPassword && password !== 'eda2411' && password !== '2411') {
      return res.status(401).json({ success: false, error: 'Yetkisiz işlem: Hatalı şifre.' });
    }

    if (!url) {
      return res.status(400).json({ success: false, error: 'Silinecek fotoğraf URL bilgisi eksik.' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ success: false, error: 'BLOB_READ_WRITE_TOKEN bulunamadı.' });
    }

    await del(url, { token });

    return res.status(200).json({
      success: true,
      message: 'Fotoğraf Vercel Blob deposundan başarıyla silindi.'
    });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
