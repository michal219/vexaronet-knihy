# Nakladatelství Grindbooks – web

Statický web nakladatelství (katalog e-booků, detaily knih, ukázky zdarma).

- Soubory webu: složka `public/`
- Katalog knih a ceny pro web: `public/assets/knihy.js` (`platby: 'stripe'` zapíná tlačítka Koupit)
- Ceny, které strhne Stripe, a soubory ke stažení: `functions/_katalog.js` (musí sedět s knihy.js)
- Platba: `functions/api/koupit.js` (Stripe Checkout), stažení: `functions/api/stazeni.js` + stránka `public/dekujeme/`

## Spuštění prodeje přes Stripe
1. Cloudflare Pages → projekt → Settings → Variables and Secrets: přidat secret `STRIPE_SECRET_KEY` (sk_live_… nebo pro zkoušku sk_test_…).
2. Cloudflare → R2 → vytvořit bucket (např. `grindbooks-knihy`) a nahrát soubory přesně podle cest v `functions/_katalog.js`.
3. Pages → Settings → Bindings → R2 bucket: název proměnné `KNIHY`, bucket z kroku 2.
4. Stripe → Settings → Public details: vyplnit adresu podmínek (…/podminky/), aby Stripe zobrazil zaškrtávací souhlas.
5. V `public/assets/knihy.js` nastavit `platby: 'stripe'`, doplnit údaje prodávajícího v `public/podminky/` a nasadit.
6. Zkušební nákup testovací kartou 4242 4242 4242 4242 (s klíčem sk_test_…), pak přepnout na sk_live_….

Plné PDF nikdy nedávat do repozitáře (je veřejný) – patří jen do R2.
- Cloudflare Pages: Framework preset **None**, Build command `exit 0`, Build output directory `public`
