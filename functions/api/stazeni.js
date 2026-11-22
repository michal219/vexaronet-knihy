import { KATALOG, stripe, stranka } from '../_katalog.js';

// /api/stazeni?session_id=cs_...&info=1  → JSON s názvem knihy a seznamem souborů
// /api/stazeni?session_id=cs_...&soubor=0 → stažení souboru (jen když je zaplaceno)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const sid = url.searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sid)) return stranka('Neplatný odkaz', 'Odkaz ke stažení není platný.', 400);
  let s;
  try { s = await stripe(env, 'checkout/sessions/' + sid); }
  catch (e) { return stranka('Nákup nenalezen', 'Tenhle nákup jsme nenašli. Napiš nám na info@grindbooks.eu.', 404); }
  const k = KATALOG[s.metadata && s.metadata.kniha];
  if (!k) return stranka('Nákup nenalezen', 'K tomuto nákupu nemáme knihu. Napiš nám na info@grindbooks.eu.', 404);
  if (s.payment_status !== 'paid') return stranka('Platba ještě není dokončená', 'Jakmile platba projde, obnov tuhle stránku.', 402);

  const jmena = k.soubory.map(f => f.split('/').pop());
  if (url.searchParams.get('info')) {
    return Response.json({ nazev: k.nazev, email: s.customer_details && s.customer_details.email, soubory: jmena }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const i = Number(url.searchParams.get('soubor') || 0);
  const klic = k.soubory[i];
  if (!klic) return stranka('Soubor nenalezen', 'Tenhle soubor v balíčku není.', 404);
  const obj = env.KNIHY && await env.KNIHY.get(klic);
  if (!obj) return stranka('Soubor se připravuje', 'Soubor teď není dostupný. Napiš nám na info@grindbooks.eu a pošleme ti ho.', 503);
  const typ = klic.endsWith('.pdf') ? 'application/pdf' : klic.endsWith('.zip') ? 'application/zip' : 'text/plain; charset=utf-8';
  return new Response(obj.body, { headers: {
    'Content-Type': typ,
    'Content-Disposition': `attachment; filename="${jmena[i]}"`,
    'Cache-Control': 'private, no-store',
  } });
}
