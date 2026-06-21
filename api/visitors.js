// api/visitors.js
// Vercel KV を使った訪問者カウンター
// デプロイ後、Vercel Dashboard > Storage > KV を作成して環境変数を設定してください

export const config = { runtime: "edge" };

export default async function handler(req) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // Vercel KV REST API
    const KV_URL   = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_URL || !KV_TOKEN) {
      // KV未設定時はダミーを返す
      return new Response(JSON.stringify({ count: 0, error: "KV not configured" }), { headers });
    }

    // INCR コマンドでアトミックにカウントアップ
    const res = await fetch(`${KV_URL}/incr/visitor_count`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const data = await res.json();
    const count = data.result ?? 0;

    return new Response(JSON.stringify({ count }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ count: 0, error: err.message }), {
      status: 500,
      headers,
    });
  }
}
