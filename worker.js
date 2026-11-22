// Vstupní bod Workera. Směruje /api/* na existující funkce (beze změny jejich kódu),
// všechno ostatní servíruje jako statický soubor z public/ (viz wrangler.jsonc: assets.directory).
// Pozn.: dřívější konvence „Pages Functions" (soubory v functions/api/*.js s export onRequestGet)
// se v tomto novém (Workers Builds) nastavení sama nespouští – proto je sem potřeba explicitně napojit.
import { onRequestGet as koupitGet } from './functions/api/koupit.js';
import { onRequestGet as stazeniGet } from './functions/api/stazeni.js';

const ROUTES = {
  'GET /api/koupit': koupitGet,
  'GET /api/stazeni': stazeniGet,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handler = ROUTES[`${request.method} ${url.pathname}`];
    if (handler) {
      try {
        return await handler({ request, env, ctx });
      } catch (e) {
        return new Response('Interní chyba serveru. Zkus to prosím znovu.', { status: 500 });
      }
    }
    // cesta pod /api/, na kterou nic nereaguje (např. jiná metoda) -> 404, ne statický soubor
    if (url.pathname.startsWith('/api/')) return new Response('Nenalezeno', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
