# Vizitų kalendorius Lumidentai

Statome dviem etapais: pirma Erika gauna pilnai veikiantį kalendorių sau, o svetainė tik rodo laisvus ir užimtus laikus. Kai kalendorius realiai naudojamas kelias savaites ir tvarkaraštis nusistovi, įjungiame viešą registraciją tame pačiame kalendoriuje – tam nereikės nieko perdaryti, tik įjungti antrą dalį.

Kodėl taip: registracijos variklio esmė yra ne forma, o laisvų laikų skaičiavimas (darbo valandos minus išimtys minus jau užimti vizitai). Tą patį skaičiavimą naudoja ir Erikos kalendorius, ir viešoji forma. Padarius jį pirma, antras etapas tampa maža užduotimi, o Erika iškart turi naudos.

## 1 etapas — Erikos kalendorius (admin)

**Darbo laikas.** Naujoje admin skiltyje „Kalendorius“ Erika nusistato savaitinį grafiką: kiekvienai savaitės dienai gali pridėti vieną ar kelis darbo intervalus (pvz. antradienis 9:00–13:00 ir 15:00–19:00), likusios dienos – laisvos. Atskirai gali pažymėti išimtis: atostogos, šventės, vienkartinis papildomas darbo laikas.

**Vizitų vedimas.** Savaitės rodinys su valandų tinkleliu. Erika:
- spusteli laisvą langelį → atsidaro forma: paslauga, trukmė, paciento vardas, telefonas, el. paštas, pastaba;
- vizitus tempia pele į kitą laiką, tempia kraštą trukmei pakeisti;
- telefone tas pats veikia liečiant: paspaudus vizitą atsidaro kortelė su laiko ir trukmės keitikliais (be smulkaus tempimo);
- gali pažymėti „užblokuotas laikas“ be paciento (pietūs, kelionė, asmeniniai reikalai).

Vizito būsenos: laukiantis patvirtinimo, patvirtintas, atvyko, neatvyko, atšauktas. Erikos pačios vedami vizitai iškart patvirtinti.

**Teisės.** Kalendorių valdo savininkas ir developeris. Redaktorius mato, bet nekeičia – kaip ir visur kitur.

**Svetainėje.** Naujas viešas kalendoriaus vaizdas (kontaktų puslapyje arba atskirame „Registracija“ puslapyje): savaitė su darbo valandomis, laisvi laikai žali, užimti – pilki, be jokių pacientų duomenų. Šalia – kvietimas skambinti arba rašyti. Nedarbo dienos aiškiai matomos.

## 2 etapas — pacientų registracija svetainėje

Tas pats viešas kalendorius tampa spaudžiamas: pacientas pasirenka paslaugą → laisvą laiką → įveda vardą, telefoną, el. paštą, trumpą pastabą ir sutikimą su privatumo politika. Užklausa krinta į Erikos kalendorių kaip „laukianti patvirtinimo“ ir laikas iškart rodomas užimtas, kad du žmonės nepasirinktų to paties. Erika admin panelėje patvirtina arba atmeta; nepatvirtinta užklausa automatiškai atsilaisvina po 48 val.

**Apsauga nuo botų (rekomendacija pirmai versijai).** Be SMS ir be privalomo el. pašto patvirtinimo:
- paslėptas laukelis ir minimalus pildymo laikas – atmeta paprastus botus;
- ribojimas: iš to paties įrenginio/IP – ne daugiau 3 užklausos per parą, tas pats telefono numeris – ne daugiau 2 aktyvių užklausų;
- Cloudflare Turnstile (nemokamas, be varginančių paveiksliukų) – atmeta likusius;
- Erikos patvirtinimas yra galutinis filtras: net prasprūdusi šiukšlė niekada netampa realiu vizitu.

El. paštas lieka neprivalomas (kas turi – gaus patvirtinimo laišką), telefonas privalomas. SMS patvirtinimą galima pridėti vėliau, jei šiukšlių atsirastų.

**Pranešimai.** Erikai – laiškas apie naują užklausą, tas pats kanalas kaip dabar veikiančios užklausų žinutės. Pacientui – patvirtinimo arba atmetimo laiškas, jei paliko el. paštą.

## Techninė dalis

Naujos lentelės: `working_hours` (savaitės diena, pradžia, pabaiga), `schedule_exceptions` (data, uždaryta/papildomas laikas), `appointments` (paslauga, pradžia, trukmė, paciento kontaktai, būsena, šaltinis – admin/web). Prie `services` – trukmė minutėmis ir „rodyti registracijoje“ žymė.

Prieigos taisyklės: pacientų duomenis mato tik personalas; anonimiškai skaitomas tik laisvų/užimtų intervalų sąrašas per serverio funkciją, kuri grąžina vien laiką ir būseną – jokių vardų ar telefonų. Laisvi laikai skaičiuojami serveryje (`availability.functions.ts`): darbo valandos minus išimtys minus aktyvūs vizitai, žingsnis pagal paslaugos trukmę. Vieta – vienas kabinetas, todėl persidengimo tikrinimas paprastas: duomenų bazės lygyje neleidžiama dviem aktyviems vizitams persidengti laike.

Admin kalendoriui – lengva biblioteka su tempimu, apvilkta esamu Lumidenta stiliumi (Manrope, esama paletė, apvalinimai). Antrame etape – Turnstile raktai kaip serverio paslaptys.

## Ką paleidžiame dabar

1 etapą pilna apimtimi. 2 etapą pradedame atskiru prašymu, kai Erika patvirtins, kad grafikas kalendoriuje atspindi tikrovę.
