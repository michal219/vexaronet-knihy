// GET /api/prihlasky?token=...  → CSV všech přihlášených (jen pro majitele; vyžaduje secret ADMIN_TOKEN na Cloudflare)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.ADMIN_TOKEN) return new Response('Nenalezeno', { status: 404 });
  const t = url.searchParams.get('token') || '';
  if (t.length !== env.ADMIN_TOKEN.length || t !== env.ADMIN_TOKEN) return new Response('Nenalezeno', { status: 404 });
  const radky = ['email,datum,zdroj'];
  let cursor;
  do {
    const seznam = await env.KNIHY.list({ prefix: 'prihlasky/', cursor });
    for (const o of seznam.objects) {
      const obj = await env.KNIHY.get(o.key); if (!obj) continue;
      const p = await obj.json();
      radky.push([p.email, p.cas, p.zdroj].map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(','));
    }
    cursor = seznam.truncated ? seznam.cursor : undefined;
  } while (cursor);
  return new Response(radky.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="prihlaseni.csv"', 'Cache-Control': 'no-store' } });
}
