# Nakladatelství Grindbooks – web

Statický web nakladatelství (katalog e-booků, detaily knih, ukázky zdarma).

- Soubory webu: složka `public/`
- Katalog knih a ceny pro web: `public/assets/knihy.js` (`platby: 'stripe'` zapíná tlačítka Koupit)
- Ceny, které strhne Stripe, a soubory ke stažení: `functions/_katalog.js` (musí sedět s knihy.js)
- Platba: `functions/api/koupit.js` (Stripe Checkout), stažení: `functions/api/stazeni.js` + stránka `public/dekujeme/`

## Nasazení (Cloudflare Workers Builds)
Projekt běží jako **Cloudflare Worker se statickými soubory** (`wrangler.jsonc` + `worker.js`), ne jako
klasické Pages. `worker.js` směruje `/api/*` na soubory ve `functions/api/*.js`; vše ostatní servíruje
jako statický soubor z `public/`. Nasazení = `git push` do `main`; Cloudflare spustí `npx wrangler deploy`
(viz Settings → Builds, pole „Deploy command" by mělo být `npx wrangler deploy`, jinak to nastavit ručně).

## Spuštění prodeje přes Stripe
1. Cloudflare dashboard → Workers & Pages → tenhle projekt → **Settings → Variables and Secrets**:
   **Add → Secret**, název `STRIPE_SECRET_KEY`, hodnota = tajný klíč ze Stripe (`sk_live_…`, pro zkoušku `sk_test_…`).
2. Cloudflare → **R2** → vytvořit bucket (u nás `grindbooks`) a nahrát soubory přesně podle cest v `functions/_katalog.js`.
3. Vazba `KNIHY` → bucket `grindbooks` je zapsaná ve `wrangler.jsonc` (`r2_buckets`).
4. Stripe → Settings → Public details: vyplnit adresu podmínek (…/podminky/), aby Stripe zobrazil zaškrtávací souhlas.
5. V `public/assets/knihy.js` nastavit `platby: 'stripe'`, doplnit údaje prodávajícího v `public/podminky/` a nasadit.
6. Zkušební nákup testovací kartou 4242 4242 4242 4242 (s klíčem sk_test_…), pak přepnout na sk_live_….

Plné PDF nikdy nedávat do repozitáře (je veřejný) – patří jen do R2.

## Slevový kód a časově omezená nabídka (balíček Podnikání od 15 let)
- Kódy jsou v `functions/_katalog.js` (`KODY`). `PODNIKAM48` změní nákup hlavní knihy na **balíček 8 e-booků za 129 Kč** (`balicek-podnikani-od-15-let`, prodává se jen s kódem).
- Kód platí jen, když běží nabídka. Spuštění na 48 hodin od teď (potřebuje secret `ADMIN_TOKEN` na Cloudflare):
  `https://grindbooks.eu/api/nabidka?spustit=1&token=TVOJE_HESLO` (ukončení: `?zrusit=1&token=...`). Stav nabídky je v R2 (`nabidka/stav.json`).
- Stránka nabídky s odpočtem: `/nabidka/`. Když nabídka běží, na všech stránkách je nahoře pruh s odpočtem.
