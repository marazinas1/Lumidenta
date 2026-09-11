# Analitikos perkėlimas į Deerva projektą

Trumpas atsakymas: taip — eik į Deerva projektą ir ten paprašyk perkelti analitiką, paminint šį projektą per `@` (pvz. `@Lumidenta`). Agentas Deerva projekte gali skaityti šio projekto kodą ir jį nusikopijuoti. Atvirkščiai (iš čia stumti į Deerva) neveikia — perkėlimas visada vyksta „iš kito projekto į tą, kuriame dirbi“.

## Ką parašyti Deerva projekte

> Perkelk analitikos sistemą iš @Lumidenta projekto. Reikia: lankytojų rinkimo be slapukų, botų filtro, „įsitraukusio lankytojo“ logikos (5 s arba paspaudimas), šalių, šaltinių, įrenginių, trukmės, atmetimo rodiklio ir konversijų, bei admin analitikos puslapio su 7/30/90 d. filtrais. Personalo apsilankymai neskaičiuojami, duomenys valomi po 14 mėnesių.

## Kas bus kopijuojama (techninė dalis)

- `src/routes/api/public/pv.ts` — serverinis rinkimo taškas
- `src/lib/page-view-tracking.ts` — kliento pusės sekimas
- `src/lib/bot-detect.ts` — botų filtras
- `src/hooks/admin/useAnalytics.ts` — duomenų užklausa
- `src/routes/_authenticated/admin.analytics.tsx` — admin puslapis (recharts)
- Duomenų bazė: `page_views` lentelė su indeksais, RLS, GRANT'ai ir `analytics_summary` funkcija

## Ką reikės pritaikyti Deerva projekte

- Rolės: čia naudojamas `developer/owner/editor` modelis — Deerva turi savo, tad personalo atpažinimas ir prieigos taisyklės rašomos pagal Deerva roles.
- Konversijos: čia skaičiuojamos pagal `leads` lentelę — Deerva reikės nurodyti, kas laikoma konversija.
- Tekstai: admin puslapis lietuviškas; jei Deerva kitos kalbos — versti.
- Meniu: analitikos nuorodą reikės įdėti į Deerva admin navigaciją.

## Šiame (Lumidenta) projekte

Nieko keisti nereikia — analitika lieka kaip yra.
