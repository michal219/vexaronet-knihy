// POST /api/prihlaska  { email, souhlas: true, vek: true, zdroj, web }  → uloží přihlášku k novinkám do R2 (prefix prihlasky/)
// Bez souhlasu se nic neukládá. Pole "web" je past na roboty (člověk ho nevidí ani nevyplní).
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false, chyba: 'Neplatný původ požadavku.' }, 403);
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, chyba: 'Neplatný požadavek.' }, 400); }
  if (d.web) return json({ ok: true }); // robot: tváříme se, že vše dopadlo dobře, a nic neukládáme
  const email = String(d.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return json({ ok: false, chyba: 'Zadej prosím platný e-mail.' }, 400);
  if (d.souhlas !== true || d.vek !== true) return json({ ok: false, chyba: 'Pro přihlášení je potřeba souhlas a potvrzení věku.' }, 400);
  if (!env.KNIHY) return json({ ok: false, chyba: 'Přihlášení se připravuje. Zkus to prosím později.' }, 503);
  const klic = 'prihlasky/' + await hash(email) + '.json';
  if (await env.KNIHY.head(klic)) return json({ ok: true, uz: true });
  await env.KNIHY.put(klic, JSON.stringify({ email, cas: new Date().toISOString(), zdroj: String(d.zdroj || '').slice(0, 120), souhlas: 'novinky, ukázky a slevy e-mailem; věk 15+ potvrzen' }), { httpMetadata: { contentType: 'application/json' } });
  return json({ ok: true });
}
