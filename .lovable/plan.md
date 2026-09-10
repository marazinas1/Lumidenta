# Kainos — kainoraštis svetainėje

Erika teisi: kainų skilties svetainėje kol kas nėra — ji buvo atidėta vėlesniam etapui. Dabar ją padarome.

## Ką matys lankytojas

- Naujas puslapis **Kainos** (`/kainos`), nuoroda meniu ir poraštėje.
- Puslapyje — paslaugų sąrašas su kaina prie kiekvienos (plomba, burnos higiena, kanalų valymas ir t. t.), suskirstytas pagal jau esamas paslaugas.
- Trumpas įžanginis tekstas viršuje ir pastaba apačioje, kad galutinė kaina priklauso nuo situacijos ir patvirtinama po apžiūros.
- Kaina taip pat rodoma kiekvienos paslaugos puslapyje (`/paslaugos/...`), kad nereikėtų ieškoti atskirai.
- Jei kaina neįrašyta — tiesiog nerodoma, jokių tuščių langelių.

## Ką galės keisti Erika

Admin → Svetainė → Paslaugos, prie kiekvienos paslaugos atsiranda du nauji laukai:

- **Kaina** — laisvas tekstas, be griežtų rėmų: „45 €", „nuo 40 €", „40–80 €", „pagal konsultaciją".
- **Kainos pastaba** — nebūtina, smulkus paaiškinimas po kaina (pvz. „vienam dančiui").

Admin → Svetainė → Kainos puslapio tekstai (antraštė, įžanga, pastaba apačioje) — kaip ir kituose puslapiuose, per tekstų slotus, su grąžinimu į numatytąją reikšmę.

Kaip ir su straipsniais: iš karto įrašau apytiksles bazines kainas kaip pradinį variantą, o Erika jas pasitikslina pati per admin. Prieš viešą paleidimą kainos privalo būti jos patvirtintos — sveikatos paslaugų reklama reguliuojama, todėl išgalvotos kainos negali likti.

## Techninė dalis

- Migracija: `services` lentelėje nauji stulpeliai `price_text text not null default ''` ir `price_note text not null default ''`. RLS nesikeičia.
- `catalog.functions.ts`: `ServiceRow` papildomas `priceText`, `priceNote`; jie įtraukiami į viešą užklausą.
- `catalog-admin.functions.ts`: `serviceFields` papildomas abiem laukais (validacija iki 120 / 200 simbolių).
- `admin.website.services.tsx`: du nauji įvesties laukai, paklūstantys esamai redaktoriaus tik-skaitymo logikai.
- Naujas `src/pages/kainos.tsx` + `src/routes/kainos.tsx` (ir `/en` veidrodis nekuriamas — `lt` išlieka vienintelė kalba). Loader: `ensurePageContent` + `ensureCatalog`. `head()` su savo `title`, `description`, `og:*`, kanoniniu adresu.
- Kainos eilutės naudoja esamą kortelių/sąrašo stilistiką, `Reveal`/`RevealItems` efektus; jokių naujų spalvų.
- Nuoroda `src/data/nav.ts` ir poraštėje; `sitemap.xml` papildomas nauju keliu.
- Pradinės kainos įrašomos `UPDATE` sakiniais (ne migracijoje), pagal AGENTS.md #3.
