// POST /api/odhlaseni  { email }  → smaže přihlášku (odvolání souhlasu)
import { hash, json } from './prihlaska.js';
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false }, 403);
  let d; try { d = await request.json(); } catch { return json({ ok: false, chyba: 'Neplatný požadavek.' }, 400); }
  const email = String(d.email || '').trim().toLowerCase();
  if (!email || email.length > 254) return json({ ok: false, chyba: 'Zadej prosím e-mail.' }, 400);
  if (!env.KNIHY) return json({ ok: false, chyba: 'Služba se připravuje.' }, 503);
  await env.KNIHY.delete('prihlasky/' + await hash(email) + '.json');
  return json({ ok: true });
}
