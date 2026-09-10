# Logotipas: valdomas iš admin + nauji variantai

Du dalykai: (1) logotipas tampa keičiamas iš Nustatymų, kaip jau veikia svetainės ikona, ir pasikeičia visur; (2) paruošiu kelis naujus Lumidenta logotipo variantus, kad būtų iš ko rinktis — dabartinis išsaugomas ir lieka, kol nenuspręsi kitaip.

## 1. Logotipas iš admin

- Nustatymuose, iškart po „Svetainės ikona (favicon)“, atsiranda laukas „Logotipas“ su ta pačia logika: peržiūra, įkėlimas, „Grąžinti numatytąjį“.
- Įkeltas failas praeina tą patį vaizdų apdorojimo kelią (dydis, optimizacija), kaip ir kitos nuotraukos.
- Įkelti gali savininkas ir developeris; redaktorius mato užrakintą lauką.
- Jei logotipas neįkeltas, rodomas numatytasis (dabartinis ženklas + užrašas Lumidenta), taigi svetainė niekada nelieka be logotipo.

## 2. Kur pasikeičia

Vienas šaltinis — vienas komponentas, naudojamas visose vietose:

- svetainės viršuje (antraštėje),
- svetainės apačioje (footeryje),
- prisijungimo prie admin lange,
- admin panelės viršuje ir šoniniame meniu.

Pakeitus logotipą Nustatymuose, jis atsinaujina visose šiose vietose iš karto.

## 3. Nauji logotipo variantai

Sugeneruosiu 3–4 variantus su užrašu „Lumidenta“, atitinkančius svetainės stilistiką: šalavijo žalia, šilta smėlio/kreminė, ramūs apvalinimai, švarus Manrope pobūdžio raštas. Kryptys:

- dabartinės žvaigždutės rafinuota versija su tvarkingesniu užrašu,
- švelnus danties/lašo siluetas kaip ženklas šalia užrašo,
- tik tipografinis sprendimas su viena subtilia detale (pvz., taškas ar lankas),
- inicialo „L“ ženklas apvaliame rėmelyje.

Parodysiu juos vizualiai — išsirinksi. Jei nė vienas nebus geresnis, paliekame dabartinį; niekas neužrašoma automatiškai.

## Techninė dalis

- `site_settings` papildoma stulpeliu `logo_path` (analogiškai `favicon_path`); GRANT/RLS nesikeičia.
- `catalog.functions.ts` grąžina `logoPath` / `logoUrl`; `catalog-admin.functions.ts` schema priima `logo_path`, mutacija saugoma su `assertOwner`.
- `LumaLogo.tsx` priima logotipo URL iš nustatymų užklausos ir turi statinį SVG fallback; `SiteHeader`, `SiteFooter`, `auth.tsx`, `admin.tsx` naudoja tą patį komponentą (jau naudoja).
- Įkėlimas per esamą `site-images` bucket ir `image-optimize.ts`; PNG/SVG, maks. plotis ~600px.
- Nauji variantai generuojami kaip failai, bet į `site_settings` nerašomi, kol nepasirenki.
