# Analitika: „Nepavyko įkelti analitikos“ – priežastis ir taisymas

## Kas vyksta

Analitikos puslapis nerodo duomenų ne dėl teisių ir ne dėl to, kad duomenų nėra – pati skaičiavimo funkcija duomenų bazėje nutrūksta su klaida dar prieš grąžindama rezultatą. Patikrinau tiesiogiai: kvietimas su tikru administratoriaus vartotoju grąžina duomenų bazės klaidą (kodas 42803).

Klaida yra dviejose vietose – „Dienų suvestinė“ ir „Šalys“. Jos abi grupuoja rezultatus neteisingu būdu, todėl visa užklausa nutrūksta ir puslapis rodo bendrą pranešimą „Nepavyko įkelti analitikos“. Visos kortelės lieka su nuliais.

## Ką pataisysiu

Viena duomenų bazės migracija, kuri perrašo `analytics_summary` funkciją:

- „Dienų“ dalis grupuojama pagal pačią dieną, o ne pagal galutinį suformuotą įrašą.
- „Šalių“ dalis grupuojama pagal šalies kodą, o ne pagal galutinį suformuotą įrašą.
- Visa kita logika (robotų filtras, 5 sekundžių sąlyga, trukmės, atmetimo rodiklis, šaltiniai, įrenginiai, konversija) lieka nepakitusi.

## Patikra po taisymo

- Funkcija iškviečiama su administratoriaus vartotoju – turi grąžinti rezultatą be klaidos.
- Atidaromas `/admin/analytics` – raudonas pranešimas turi dingti, o kortelės rodyti realius skaičius.
- Perjungiami 7 / 30 / 90 dienų diapazonai ir jungiklis „Rodyti ir trumpus apsilankymus“.

## Techninė dalis

`SELECT jsonb_build_object(..., count(*)) AS x ... GROUP BY 1` yra neteisingas – `GROUP BY 1` nurodo į išraišką, kurioje jau yra agregatas. Keičiama į grupavimą pagal `date_trunc('day', created_at AT TIME ZONE 'UTC')` ir atitinkamai pagal normalizuotą `country_code`, paliekant `ORDER BY count(*) DESC` bei `LIMIT`.
