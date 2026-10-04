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

  const { password } = req.body || {};
  const validPassword = process.env.ADMIN_PASSWORD || 'bilgehan2411';

  // Ayrıca yedek/kolay şifre olarak 'eda2411' de kabul edelim
  if (password === validPassword || password === 'eda2411' || password === '2411') {
    return res.status(200).json({
      success: true,
      token: 'admin_authenticated_' + Date.now()
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Hatalı yönetici şifresi.'
  });
};
