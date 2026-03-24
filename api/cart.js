export default async function handler(req, res) {
  const token = process.env.STOREFRONT_TOKEN;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const response = await fetch(
      `https://storefront-api.fourthwall.com/v1/carts?storefront_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      }
    );
    return res.status(200).json(await response.json());
  }

  const { id } = req.query;
  const response = await fetch(
    `https://storefront-api.fourthwall.com/v1/carts/${id}?storefront_token=${token}`
  );
  res.status(200).json(await response.json());
}
