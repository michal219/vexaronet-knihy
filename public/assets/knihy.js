/* =====================================================================
   KATALOG NAKLADATELSTVÍ
   Novou knihu přidáte tak, že zkopírujete jeden blok { … } níže.
   cena = text ceny (např. '399 Kč'). Platí se přes Stripe, když je níže platby: 'stripe'.
   Skutečnou částku, kterou Stripe strhne, určuje functions/_katalog.js – obě místa musí sedět.
   Dokud je platby prázdné (nebo chybí cena), tlačítko ukazuje „Brzy v prodeji“.
   ===================================================================== */
window.NAKLADATELSTVI = {
  nazev: 'Grindbooks',
  email: 'info@grindbooks.eu',
  web: 'https://grindbooks.eu',
  platby: ''   // zítra po nastavení Stripe přepnout na 'stripe'
};

window.KNIHY = [
  {
    id: 'vlastni-web-pomoci-ai',
    nazev: 'Vlastní web pomocí AI',
    podtitul: 'Od nápadu k hotovému webu bez znalosti programování',
    autor: 'Grindbooks',
    kategorie: 'Technologie',
    stran: 76,
    kapitol: 13,
    format: 'PDF + bonusy',
    novinka: false,
    obalka: '/img/knihy/vlastni-web/obalka.jpg',
    zadni: '/img/knihy/vlastni-web/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/vlastni-web-pomoci-ai/',
    perex: 'Krok za krokem od instalace nástrojů přes první stránku až po zveřejnění na internetu. Kód napíše AI, vy říkáte, co chcete.',
    // ukázka k listování: strany v pořadí (první = obálka)
    ukazka: ['01','04','05','06','07','13','14','26','27','47','48','73','74','99'].map(n => `/img/knihy/vlastni-web/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/vlastni-web'
    cena: '399 Kč'
  },
  {
    id: 'vlastni-e-shop-pomoci-ai',
    nazev: 'Vlastní e-shop pomocí AI',
    podtitul: 'Od prvního produktu k první objednávce bez znalosti programování',
    autor: 'Grindbooks',
    kategorie: 'Podnikání',
    stran: 58,
    kapitol: 13,
    format: 'PDF + bonusy',
    novinka: false,
    obalka: '/img/knihy/vlastni-eshop/obalka.jpg',
    zadni: '/img/knihy/vlastni-eshop/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/vlastni-e-shop-pomoci-ai/',
    perex: 'Katalog, košík, platby kartou přes Stripe, doprava, právní minimum a spuštění. Vlastní obchod bez měsíčního paušálu za platformu.',
    ukazka: ['01','04','05','06','07','23','25','30','31','39','40','55','56','99'].map(n => `/img/knihy/vlastni-eshop/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/vlastni-eshop'
    cena: '449 Kč'
  },
  {
    id: 'vlastni-aplikace-pomoci-ai',
    nazev: 'Vlastní aplikace pomocí AI',
    podtitul: 'Od nápadu k funkční aplikaci s přihlášením a databází, bez znalosti programování',
    autor: 'Grindbooks',
    kategorie: 'Technologie',
    stran: 52,
    kapitol: 10,
    format: 'PDF (A5) + ukázková aplikace',
    novinka: false,
    obalka: '/img/knihy/vlastni-aplikace/obalka.jpg',
    zadni: '/img/knihy/vlastni-aplikace/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/vlastni-aplikace-pomoci-ai/',
    perex: 'Evidence zakázek s přihlášením a databází: návrh, Supabase, zabezpečení dat, testování a zveřejnění.',
    ukazka: ['01','04','05','06','07','19','20','23','24','31','32','48','49','99'].map(n => `/img/knihy/vlastni-aplikace/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/vlastni-aplikace'
    cena: '399 Kč'
  },
  {
    id: 'jak-vytvorit-vlastniho-ai-chatbota',
    nazev: 'Jak vytvořit vlastního AI chatbota',
    podtitul: 'Od prvního nápadu po funkčního asistenta na vlastním webu',
    autor: 'Grindbooks',
    kategorie: 'Technologie',
    stran: 40,
    kapitol: 12,
    format: 'PDF (A5) + ukázkový chatbot',
    novinka: false,
    obalka: '/img/knihy/vlastni-chatbot/obalka.jpg',
    zadni: '/img/knihy/vlastni-chatbot/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/jak-vytvorit-vlastniho-ai-chatbota/',
    perex: 'AI asistent, který odpovídá zákazníkům z vašich podkladů, přizná, když neví, a předá konverzaci člověku. Okno na web, bezpečnost a testy.',
    ukazka: ['01','04','05','06','07','13','14','18','19','29','30','38','99'].map(n => `/img/knihy/vlastni-chatbot/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/ai-chatbot'
    cena: '399 Kč'
  },
  {
    id: 'jak-automatizovat-praci-pomoci-ai',
    nazev: 'Jak automatizovat práci pomocí AI',
    podtitul: 'Praktický průvodce automatizacemi, které šetří čas a zjednodušují každodenní práci',
    autor: 'Grindbooks',
    kategorie: 'Podnikání',
    stran: 38,
    kapitol: 12,
    format: 'PDF (A5) + 16 promptů',
    novinka: false,
    obalka: '/img/knihy/automatizace/obalka.jpg',
    zadni: '/img/knihy/automatizace/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/jak-automatizovat-praci-pomoci-ai/',
    perex: 'Poptávky, e-maily, dokumenty a denní přehledy bez programování: Make, Claude a telefon. AI navrhuje, vy rozhodujete.',
    ukazka: ['01','04','05','06','09','14','15','18','19','26','29','36','99'].map(n => `/img/knihy/automatizace/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/automatizace'
    cena: '399 Kč'
  },
  {
    id: 'jak-vytvorit-vlastni-software-pomoci-ai',
    nazev: 'Jak vytvořit vlastní software pomocí AI',
    podtitul: 'Od nápadu k funkčnímu systému bez předchozích znalostí programování',
    autor: 'Grindbooks',
    kategorie: 'Technologie',
    stran: 36,
    kapitol: 12,
    format: 'PDF (A5) + ukázkové CRM',
    novinka: false,
    obalka: '/img/knihy/software/obalka.jpg',
    zadni: '/img/knihy/software/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/jak-vytvorit-vlastni-software-pomoci-ai/',
    perex: 'Vlastní CRM se zákazníky, zakázkami, přihlášením a databází. Od specifikace přes rozhraní a zabezpečení (RLS) po zveřejnění a nabídku klientům.',
    ukazka: ['01','04','05','06','09','12','17','19','20','24','29','34','99'].map(n => `/img/knihy/software/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/software'
    cena: '399 Kč'
  },
  {
    id: 'jak-vytvaret-profesionalni-videa-pomoci-ai',
    nazev: 'Jak vytvářet profesionální videa pomocí AI',
    podtitul: 'Od prvního nápadu až po hotová videa pro sociální sítě, reklamy a YouTube',
    autor: 'Grindbooks',
    kategorie: 'Technologie',
    stran: 40,
    kapitol: 12,
    format: 'PDF (A5) + sada promptů',
    novinka: true,
    obalka: '/img/knihy/video/obalka.jpg',
    zadni: '/img/knihy/video/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/jak-vytvaret-profesionalni-videa-pomoci-ai/',
    perex: '30sekundová reklama 9:16 krok za krokem: scénář, video prompty, AI záběry, voiceover, hudba, střih a titulky. Plus licence, označování AI obsahu a vyhodnocení výsledků.',
    ukazka: ['01','04','05','08','10','13','15','18','21','23','25','31','99'].map(n => `/img/knihy/video/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/video'
    cena: '399 Kč'
  },
  {
    id: 'gta-6-clipping-pro-zacatecniky',
    nazev: 'GTA 6 Clipping pro začátečníky',
    podtitul: 'Jak začít vydělávat na klipech, kde najít placené kampaně a jak nechat Clauda hlídat stream',
    autor: 'Grindbooks',
    kategorie: 'Podnikání',
    stran: 20,
    kapitol: 6,
    format: 'PDF (A5) + prompt zdarma',
    novinka: true,
    obalka: '/img/knihy/clipping/obalka.jpg',
    zadni: '/img/knihy/clipping/zadni.jpg',
    hrbet: '#0b2545',
    akcent: '#2ec4b6',
    detail: '/kniha/gta-6-clipping-pro-zacatecniky/',
    perex: 'GTA 6 vychází 19. listopadu a placené kampaně na klipy přibývají každý den. Zjistíš, kdo za klipy platí, kde najdeš GTA 6 kampaně i kampaně ze streamů a podcastů a jak udělat první klip. Bonus zdarma: prompt, se kterým Claude hlídá stream a sám dělá shorty. Výdělek není zaručený, ale cestu k němu dostaneš krok za krokem.',
    ukazka: ['01','03','04','05','06','07','08','10','11','13','16','19','99'].map(n => `/img/knihy/clipping/ukazka/${n}.jpg`),
    gumroad: '',   // např. 'https://grindbooks.gumroad.com/l/gta-6-clipping'
    cena: '249 Kč'
  }
];
