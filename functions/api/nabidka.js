// GET /api/nabidka            → { aktivni, do, zbyva }  (veřejné, pro odpočet na webu)
// GET /api/nabidka?spustit=1&token=ADMIN_TOKEN  → zapne nabídku na 48 hodin od teď (jen pokud neběží)
// GET /api/nabidka?zrusit=1&token=ADMIN_TOKEN   → nabídku ukončí hned
import { NABIDKA_KLIC, stavNabidky } from '../_katalog.js';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const spustit = url.searchParams.get('spustit'), zrusit = url.searchParams.get('zrusit');
  if (spustit || zrusit) {
    const t = url.searchParams.get('token') || '';
    if (!env.ADMIN_TOKEN || t.length !== env.ADMIN_TOKEN.length || t !== env.ADMIN_TOKEN) return new Response('Nenalezeno', { status: 404 });
    if (!env.KNIHY) return json({ ok: false, chyba: 'Úložiště není připojené.' }, 503);
    if (zrusit) { await env.KNIHY.delete(NABIDKA_KLIC); return json({ ok: true, aktivni: false }); }
    const s = await stavNabidky(env);
    if (s.aktivni) return json({ ok: true, aktivni: true, do: s.do, zprava: 'Nabídka už běží.' });
    const do_ = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    await env.KNIHY.put(NABIDKA_KLIC, JSON.stringify({ start: new Date().toISOString(), do: do_ }), { httpMetadata: { contentType: 'application/json' } });
    return json({ ok: true, aktivni: true, do: do_ });
  }
  const s = await stavNabidky(env);
  return json({ aktivni: s.aktivni, do: s.do || null, zbyva: s.aktivni ? Math.max(0, Math.floor((Date.parse(s.do) - Date.now()) / 1000)) : 0 });
}
