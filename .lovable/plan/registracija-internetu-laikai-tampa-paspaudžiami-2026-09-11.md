# Registracija internetu: laikai tampa paspaudžiami

## Kaip yra dabar

Puslapyje „Registracija“ laisvi laikai jau skaičiuojami serveryje (darbo valandos minus išimtys minus užimti vizitai), bet rodomi tik kaip informacija — nieko paspausti negalima. Pacientas turi skambinti arba rašyti. Duomenų bazėje vizitų lentelė jau paruošta ir turi būseną „laukia patvirtinimo“ bei šaltinį (admin / web), taigi trūksta tik viešos formos ir pranešimų.

## Pasaulinė praktika

Odontologijoje vyrauja du modeliai:

1. **Užklausa su patvirtinimu** (dažniausias mažuose kabinetuose): pacientas pasirenka laiką, gydytoja patvirtina. Laikas tuoj pat rezervuojamas laikinai, kad du žmonės nepasirinktų to paties.
2. **Momentinis patvirtinimas** (didesnės klinikos su registratūra): laikas patvirtinamas iškart.

Erikai tinka 1 modelis — solo praktikoje reikia pamatyti, ar vizito trukmė atitinka poreikį. Prie jo vėliau lengva prijungti rezervacijos mokestį.

## Ką padarysiu

1. **Laikai tampa mygtukais.** Paspaudus laisvą laiką atsidaro trumpa forma: paslauga (su trukme), vardas, telefonas, el. paštas (neprivalomas), trumpa pastaba ir sutikimo su privatumo politika varnelė. Jokių simptomų ar sveikatos laukų.
2. **Trukmė pagal paslaugą.** Pasirinkus paslaugą, laisvi laikai persiskaičiuoja pagal jos trukmę (ne visada 30 min.).
3. **Užklausa iškart užima laiką.** Sukuriamas vizitas su būsena „laukia patvirtinimo“ — kitiems lankytojams tas laikas iškart pilkas. Nepatvirtinta užklausa automatiškai atsilaisvina po 48 val.
4. **Pranešimas Erikai:** burbuliukas su skaičiumi admin meniu prie „Kalendorius“ (kaip dabar prie užklausų) + el. laiškas su paciento duomenimis ir laiku.
5. **Patvirtinimas / atmetimas.** Kalendoriuje prie laukiančio vizito — mygtukai „Patvirtinti“ ir „Atmesti“. Pacientui, jei paliko el. paštą, išeina atitinkamas laiškas.
6. **Apsauga nuo šiukšlių.** Paslėptas laukelis, minimalus pildymo laikas, ribojimas (3 užklausos per parą iš to paties įrenginio, 2 aktyvios užklausos tam pačiam telefonui). Turnstile (nemokamas Cloudflare filtras) pridedamas tik jei šiukšlių atsirastų — nenoriu be reikalo apsunkinti formos.

## Rezervacijos mokestis (10 EUR) — mintis ateičiai

Nedarome dabar, bet statau taip, kad vėliau užtektų įjungti:
- vizito lentelėje paliekama vieta mokėjimo būsenai ir sumai;
- modelis, kuris veikia geriausiai: mokestis imamas tik už laikus, kuriuos Erika pažymi „reikalauja užstato“ (pvz. ilgi vizitai), ir įskaitomas į vizito kainą; neatvykus be įspėjimo — negrąžinamas;
- techniškai tai Stripe mokėjimo langas prieš patvirtinant užklausą.
Verta įjungti tada, kai atsiras realių neatvykimų — anksčiau tai tik mažina registracijų.

## Ko reikės iš Jūsų / Erikos

- Kad kalendoriuje būtų realios darbo valandos (kitaip pacientas matys tuščią savaitę).
- Paslaugų trukmės minutėmis, jei dar ne visos suvestos.
- Sprendimas, ar el. paštas paciento formoje privalomas (siūlau ne — telefonas privalomas).

## Techninė dalis

- Nauja serverio funkcija `requestAppointment` (viešas `createServerFn`): Zod validacija, pakartotinis laisvumo patikrinimas serveryje, įrašas per service-role klientą su `status='pending'`, `source='web'`; persidengimą papildomai gaudo esamas DB exclusion constraint.
- `fetchPublicSchedule` papildoma paslaugų sąrašu (id, pavadinimas, trukmė, `bookable`), kad forma nedarytų antro užklausimo.
- `src/pages/registracija.tsx`: laikai → mygtukai, dialogas su forma, sėkmės būsena; laisvi laikai skaičiuojami `freeSlotsFor` su paslaugos trukme kaip žingsniu.
- Pranešimai: `sendEmail` iš `notifications.server.ts` (siuntėjas nekeičiamas) Erikai į `site_settings.email`; pacientui — patvirtinimo/atmetimo laiškas.
- Admin: laukiančių užklausų skaičius meniu + patvirtinti/atmesti veiksmai kalendoriuje; teisės kaip visur (savininkas ir developeris keičia, redaktorius mato).
- Automatinis 48 val. atlaisvinimas — foninis valymas užklausiant kalendorių (be atskiro cron), pasenusios `pending` eilutės pažymimos `cancelled`.
