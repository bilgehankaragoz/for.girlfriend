const { put } = require('@vercel/blob');

const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

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
    const { filename, fileBase64, password } = req.body || {};

    // Güvenlik doğrulaması
    const validPassword = process.env.ADMIN_PASSWORD || 'bilgehan2411';
    if (password !== validPassword && password !== 'eda2411' && password !== '2411') {
      return res.status(401).json({ success: false, error: 'Yetkisiz erişim: Hatalı şifre.' });
    }

    if (!fileBase64 || !filename) {
      return res.status(400).json({ success: false, error: 'Dosya içeriği veya dosya adı eksik.' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ success: false, error: 'BLOB_READ_WRITE_TOKEN yapılandırılmamış.' });
    }

    // Base64 header temizleme (örn: data:image/jpeg;base64,)
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Dosya adını sanitize et ve benzersiz yap
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `photo_${Date.now()}_${cleanName}`;

    const blob = await put(finalFilename, buffer, {
      access: 'public',
      token
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
