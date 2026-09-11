# Įspėjimas prisijungusiam, kai įjungti techniniai darbai

## Problema

Įjungus techninius darbus, svečiai (incognito) mato „Svetainė laikinai atnaujinama“, o Jūs, kaip prisijungęs, matote įprastą svetainę — ir nesimato, kad lankytojams ji uždaryta.

## Sprendimas

Prisijungusiam vartotojui viršuje, virš svetainės antraštės, rodoma plona juostelė per visą plotį:

- Tekstas: „Techniniai darbai įjungti — svetainę matote tik Jūs, prisijungę. Lankytojams rodomas atnaujinimo pranešimas.“
- Mygtukas „Peržiūrėti kaip lankytojas“ — laikinai parodo tą patį atnaujinimo langą, kurį mato svečiai, su galimybe grįžti atgal.
- Nuoroda „Išjungti“ — nuveda į Admin → Nustatymai, kur yra jungiklis.
- Juostelė rodoma tik tada, kai techniniai darbai įjungti, ir tik prisijungusiems. Svečiai jos niekada nemato.

Juostelė yra „lipni“ (lieka viršuje slenkant), spalva — šiltas smėlio/gintaro atspalvis iš esamos paletės, kad aiškiai skirtųsi nuo svetainės, bet neatrodytų svetimai. Svetainės antraštė pastumiama žemyn, kad juostelė nieko neuždengtų.

Tas pats įspėjimas trumpa forma rodomas ir admin pusėje (viršuje), kad ir Erika, dirbdama admin panelėje, matytų, jog svetainė šiuo metu uždaryta lankytojams.

## Techninė dalis

- Naujas komponentas `src/components/site/MaintenanceBanner.tsx`; būsena imama iš jau esamų `catalogQuery` (`settings.maintenanceMode`) ir `useSignedIn()`.
- `src/routes/__root.tsx` `PublicShell`: kai `maintenance && signedIn === true`, virš `SiteHeader` renderinama juostelė; „Peržiūrėti kaip lankytojas“ perjungia vietinę būseną, kuri parodo esamą `MaintenanceScreen` su grįžimo mygtuku.
- Admin karkase (`src/routes/_authenticated/admin.tsx`) — ta pati juostelė kompaktiška versija.
- Logikos, teisių ir DB pakeitimų nereikia — tik atvaizdavimas.
