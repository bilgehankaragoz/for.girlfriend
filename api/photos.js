const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN eksik.' });
    }

    const { blobs } = await list({ token });
    
    // Yüklenme tarihine göre sırala (en yeni en başta)
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return res.status(200).json({
      success: true,
      photos: sorted.map(b => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt
      }))
    });
  } catch (err) {
    console.error('Photos list error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
