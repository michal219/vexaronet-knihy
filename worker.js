// Vstupní bod Workera. Směruje /api/* na existující funkce (beze změny jejich kódu),
// všechno ostatní servíruje jako statický soubor z public/ (viz wrangler.jsonc: assets.directory).
// Pozn.: dřívější konvence „Pages Functions" (soubory v functions/api/*.js s export onRequestGet)
// se v tomto novém (Workers Builds) nastavení sama nespouští – proto je sem potřeba explicitně napojit.
import { onRequestGet as koupitGet } from './functions/api/koupit.js';
import { onRequestGet as stazeniGet } from './functions/api/stazeni.js';
import { onRequestPost as prihlaskaPost } from './functions/api/prihlaska.js';
import { onRequestPost as odhlaseniPost } from './functions/api/odhlaseni.js';
import { onRequestGet as prihlaskyGet } from './functions/api/prihlasky.js';

const ROUTES = {
  'GET /api/koupit': koupitGet,
  'GET /api/stazeni': stazeniGet,
  'POST /api/prihlaska': prihlaskaPost,
  'POST /api/odhlaseni': odhlaseniPost,
  'GET /api/prihlasky': prihlaskyGet,
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
