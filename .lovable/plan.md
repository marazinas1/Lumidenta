# Kainoraštis kaip atskira skiltis

Šiuo metu kaina yra tik viena eilutė prie kiekvienos paslaugos (8 įrašai), o `/kainos` puslapis tiesiog jas surašo. Odontologijoje taip nedaroma: kainoraštis yra savarankiškas sąrašas, kur po kiekviena sritimi eina konkrečios procedūros su savo kainomis (konsultacija, rentgeno nuotrauka, plomba, kanalų gydymas ir t. t.). Padarysime būtent tai.

## Kaip tai atrodys pacientui

`/kainos` puslapis: antraštė, trumpa įžanga, tada kainoraštis, suskirstytas į grupes:

```text
Konsultacijos ir diagnostika
  Pirminė konsultacija su gydymo planu ................ 25 €
  Rentgeno nuotrauka (vieno danties) ................... 10 €

Profilaktika ir higiena
  Profesionali burnos higiena ..................... nuo 60 €
  Fluoro aplikacija ................................... 15 €
```

- Kiekviena eilutė: pavadinimas, neprivalomas paaiškinimas smulkiu šriftu, kaina dešinėje.
- Grupės — tokios pačios ramios kortelės, kokios jau naudojamos svetainėje; jokių naujų spalvų.
- Viršuje – paieškos/filtro nėra (sąrašas nedidelis), bet mobiliajame kiekviena grupė lieka aiškiai atskirta.
- Apačioje – pastaba, kad kainos orientacinės ir tvirtinamos po apžiūros, bei mygtukas susisiekti.
- Paslaugos puslapyje lieka trumpa „nuo X €“ žymė su nuoroda „Visas kainoraštis →“, kad žmogus nesijaustų paliktas be konteksto.

## Ką Erika galės daryti admin dalyje

Nauja skiltis „Kainos“ (pakeis dabartinę, kur tik tekstai):
- Kurti, pervadinti, perstumti ir trinti grupes.
- Kiekvienoje grupėje pridėti eilutes: pavadinimas, kaina (laisvas tekstas, pvz. „nuo 60 €“ arba „25 €“), paaiškinimas, eiliškumas, rodyti/slėpti.
- Keisti puslapio antraštę, įžangą ir apatinę pastabą (tai jau veikia).
- Redaktoriaus teisėmis viskas matoma, bet neredaguojama, kaip ir kitur.

## Pradinis turinys

Sukursiu grupes ir eilutes pagal Erikos senosios svetainės kainoraštį (iš PDF), su ten nurodytomis kainomis. Kur kainos nežinomos, eilutė bus su tekstu „pagal konsultaciją“, kad nieko neišgalvočiau. Erika viską galės pasitikslinti pati.

## Techninė dalis

- Migracija: `price_groups` (title, sort_order, published) ir `price_items` (group_id, title, note, price_text, sort_order, published) su GRANT, RLS — viešas skaitymas tik publikuotų, rašymas per `is_owner`, skaitymas visų per `is_staff`.
- Kainoraštis pridedamas į `fetchCatalog` (vienas viešas SSR užklausų rinkinys, kaip dabar).
- Admin CRUD per `catalog-admin.functions.ts` su `assertOwner`, sąrašai per `assertStaff`.
- `src/pages/kainos.tsx` perrašomas į grupių sąrašą; `src/routes/_authenticated/admin.website.prices.tsx` papildomas grupių/eilučių tvarkymu.
- Paslaugų `price_text` / `price_note` laukai lieka (jie naudojami trumpai žymei paslaugos puslapyje).
- Stilius — esami `.luma` tokenai, Manrope, reveal efektai; naujų spalvų nėra.
