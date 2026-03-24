export default async function handler(req, res) {
  const token = process.env.STOREFRONT_TOKEN;
  const collection = req.query.collection || 'all';

  const response = await fetch(
    `https://storefront-api.fourthwall.com/v1/collections/${collection}/products?storefront_token=${token}`
  );

  const data = await response.json();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(data);
}
