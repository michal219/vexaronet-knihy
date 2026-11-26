import { KATALOG, stripe, stranka, uplatnitKod } from '../_katalog.js';

// /api/koupit?kniha=<id>  → vytvoří platbu ve Stripe a přesměruje na platební stránku
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  let id = url.searchParams.get('kniha');
  let k = KATALOG[id];
  if (!k) return stranka('Kniha nenalezena', 'Tahle kniha v katalogu není.', 404);
  const kod = (url.searchParams.get('kod') || '').trim().toUpperCase().slice(0, 40);
  let cena = k.cena, procent = 0;
  if (kod) {
    const r = await uplatnitKod(env, kod, id);
    if (!r.ok) return stranka('Slevový kód nelze použít', r.zprava, 400);
    id = r.id; k = KATALOG[id]; cena = k.cena;
    if (r.procent) { procent = r.procent; cena = Math.round(cena * (100 - procent) / 100); }
  } else if (k.jenSKodem) {
    return stranka('Jen se slevovým kódem', 'Tenhle balíček se prodává jen v časově omezené nabídce. Podívej se na <a href="/nabidka/">stránku nabídky</a>.', 400);
  }
  if (!env.STRIPE_SECRET_KEY) return stranka('Prodej se připravuje', 'Platby zatím nejsou zapnuté. Zkus to prosím za chvíli nebo nám napiš na info@grindbooks.eu.', 503);
  const data = {
    mode: 'payment',
    locale: 'cs',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'czk',
    'line_items[0][price_data][unit_amount]': String(cena),
    'line_items[0][price_data][product_data][name]': `E-book: ${k.nazev}`,
    'metadata[kniha]': id,
    ...(kod ? { 'metadata[kod]': kod, 'payment_intent_data[metadata][kod]': kod } : {}),
    'payment_intent_data[metadata][kniha]': id,
    'payment_intent_data[description]': `E-book: ${k.nazev}`,
    success_url: `${url.origin}/dekujeme/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/kniha/${id}/`,
    'custom_text[submit][message]': `Kliknutím souhlasíš s podmínkami nákupu (${url.origin}/podminky/) a s tím, že e-book dostaneš ke stažení hned, čímž zaniká právo odstoupit od smlouvy do 14 dnů.`,
  };
  try {
    let s;
    // zaškrtávací souhlas s podmínkami; Stripe ho povolí, až je v nastavení účtu vyplněná adresa podmínek
    try { s = await stripe(env, 'checkout/sessions', { ...data, 'consent_collection[terms_of_service]': 'required' }); }
    catch (e1) { console.log('Stripe: 1. pokus (se souhlasem s podmínkami) selhal:', e1.message); s = await stripe(env, 'checkout/sessions', data); }
    return Response.redirect(s.url, 303);
  } catch (e) {
    console.error('Stripe checkout/sessions selhalo:', e.message);
    return stranka('Platbu se nepodařilo spustit', 'Omlouváme se, zkus to prosím znovu. Pokud to nepůjde, napiš nám na info@grindbooks.eu.', 502);
  }
}
