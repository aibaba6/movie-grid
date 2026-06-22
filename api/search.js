export const config = { runtime: "edge" };

export default async function handler(req) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const lang  = searchParams.get("lang") || "ja-JP";
    if (!query.trim()) return new Response(JSON.stringify({ results: [] }), { headers });
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "no key" }), { status: 500, headers });
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=${lang}&page=1`;
    const res = await fetch(url);
    const data = await res.json();
    const results = (data.results || []).filter(m => m.poster_path).slice(0, 12).map(m => ({
      id: m.id,
      title: m.title || m.original_title,
      year: (m.release_date || "").slice(0, 4),
      poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      posterSmall: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
    }));
    return new Response(JSON.stringify({ results }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
