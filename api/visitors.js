export const config = { runtime: "edge" };

export default async function handler(req) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  try {
    const url   = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      return new Response(JSON.stringify({ count: 0 }), { headers });
    }
    const res = await fetch(`${url}/incr/visitor_count`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return new Response(JSON.stringify({ count: data.result ?? 0 }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ count: 0 }), { headers });
  }
}
