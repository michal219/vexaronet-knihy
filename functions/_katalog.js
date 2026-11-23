// Ceny a soubory ke stažení. Tohle čte jen server (Cloudflare), návštěvník to nevidí ani nezmění.
// cena = v haléřích (39900 = 399 Kč). Musí sedět s textem "cena" v public/assets/knihy.js.
// soubory = názvy souborů v R2 bucketu (vazba KNIHY). Co tu není, se nestáhne.
export const KATALOG = {
  'vlastni-web-pomoci-ai':                     { nazev: 'Vlastní web pomocí AI', cena: 39900, soubory: ['vlastni-web-pomoci-ai/Vlastni-web-pomoci-AI.pdf'] },
  'vlastni-e-shop-pomoci-ai':                  { nazev: 'Vlastní e-shop pomocí AI', cena: 44900, soubory: ['vlastni-e-shop-pomoci-ai/Vlastni-e-shop-pomoci-AI.pdf'] },
  'vlastni-aplikace-pomoci-ai':                { nazev: 'Vlastní aplikace pomocí AI', cena: 39900, soubory: ['vlastni-aplikace-pomoci-ai/Vlastni-aplikace-pomoci-AI.pdf'] },
  'jak-vytvorit-vlastniho-ai-chatbota':        { nazev: 'Jak vytvořit vlastního AI chatbota', cena: 39900, soubory: ['jak-vytvorit-vlastniho-ai-chatbota/AI-chatbot.pdf'] },
  'jak-automatizovat-praci-pomoci-ai':         { nazev: 'Jak automatizovat práci pomocí AI', cena: 39900, soubory: ['jak-automatizovat-praci-pomoci-ai/Automatizace-pomoci-AI.pdf'] },
  'jak-vytvorit-vlastni-software-pomoci-ai':   { nazev: 'Jak vytvořit vlastní software pomocí AI', cena: 39900, soubory: ['jak-vytvorit-vlastni-software-pomoci-ai/Vlastni-software-pomoci-AI.pdf'] },
  'jak-vytvaret-profesionalni-videa-pomoci-ai':{ nazev: 'Jak vytvářet profesionální videa pomocí AI', cena: 39900, soubory: ['jak-vytvaret-profesionalni-videa-pomoci-ai/Videa-pomoci-AI.pdf'] },
  'gta-6-clipping-pro-zacatecniky':            { nazev: 'Clipping pro začátečníky (bonus: GTA 6)', cena: 24900, soubory: ['gta-6-clipping-pro-zacatecniky/GTA-6-Clipping-pro-zacatecniky.pdf', 'gta-6-clipping-pro-zacatecniky/prompt-claude-hlida-stream.txt'] },
  'jak-zacit-podnikat-od-15-let': { nazev: "Jak začít podnikat od 15 let", cena: 34900, soubory: ['jak-zacit-podnikat-od-15-let/Jak-zacit-podnikat-od-15-let.pdf'] },
  'jak-zacit-s-doucovanim-od-15-let': { nazev: "Jak začít s doučováním", cena: 19900, soubory: ['jak-zacit-s-doucovanim-od-15-let/jak-zacit-s-doucovanim-od-15-let.pdf'] },
  'jak-zacit-se-spravou-socialnich-siti-od-15-let': { nazev: "Jak začít se správou sociálních sítí", cena: 19900, soubory: ['jak-zacit-se-spravou-socialnich-siti-od-15-let/jak-zacit-se-spravou-socialnich-siti-od-15-let.pdf'] },
  'jak-zacit-s-rucni-vyrobou-a-prodejem-od-15-let': { nazev: "Jak začít s ruční výrobou a prodejem", cena: 19900, soubory: ['jak-zacit-s-rucni-vyrobou-a-prodejem-od-15-let/jak-zacit-s-rucni-vyrobou-a-prodejem-od-15-let.pdf'] },
  'jak-zacit-se-sluzbami-pro-domacnost-od-15-let': { nazev: "Jak začít se službami pro domácnost a sousedy", cena: 19900, soubory: ['jak-zacit-se-sluzbami-pro-domacnost-od-15-let/jak-zacit-se-sluzbami-pro-domacnost-od-15-let.pdf'] },
  'jak-zacit-s-grafikou-videem-a-weby-s-ai-od-15-let': { nazev: "Jak začít s grafikou, videem a weby s AI", cena: 19900, soubory: ['jak-zacit-s-grafikou-videem-a-weby-s-ai-od-15-let/jak-zacit-s-grafikou-videem-a-weby-s-ai-od-15-let.pdf'] },
  'jak-zacit-s-ebooky-a-digitalnimi-produkty-od-15-let': { nazev: "Jak začít s e-booky a digitálními produkty", cena: 19900, soubory: ['jak-zacit-s-ebooky-a-digitalnimi-produkty-od-15-let/jak-zacit-s-ebooky-a-digitalnimi-produkty-od-15-let.pdf'] },
};

export async function stripe(env, cesta, data) {
  const init = { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } };
  if (data) { init.method = 'POST'; init.body = new URLSearchParams(data); init.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
  const r = await fetch('https://api.stripe.com/v1/' + cesta, init);
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Stripe ' + r.status);
  return j;
}

export const stranka = (nadpis, text, status = 400) => new Response(
  `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${nadpis}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;background:#071528;color:#e6eefa;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px}div{max-width:520px}a{color:#2ec4b6}</style></head>
<body><div><h1>${nadpis}</h1><p>${text}</p><p><a href="/">Zpět na nakladatelství</a></p></div></body></html>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
