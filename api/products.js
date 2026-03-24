export default async function handler(req, res) {
  const token = process.env.STOREFRONT_TOKEN; // store token as env var, not in code
  const col   = req.query.collection || 'all';
  const url   = `https://storefront-api.fourthwall.com/v1/collections/${col}/products?storefront_token=${token}`;
  const data  = await fetch(url).then(r => r.json());
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(data);
}
