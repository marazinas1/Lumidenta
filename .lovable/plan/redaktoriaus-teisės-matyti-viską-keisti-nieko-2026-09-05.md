# Redaktoriaus teisės: matyti viską, keisti nieko

Tikslas: Eriką galima pakviesti redaktorės teisėmis dabar — ji prisijungia, apžiūri visą admin panelę, dirba su užklausomis, bet nieko nekeičia. Kai infrastruktūra bus baigta, pakeičiate jos teises į savininkę ir viskas atsirakina.

## Teisių lygiai po šio pakeitimo

| Veiksmas | Redaktorius | Savininkas | Developeris |
|---|---|---|---|
| Matyti visą admin panelę (apžvalga, analitika, svetainės turinys, nustatymai) | Taip | Taip | Taip |
| Užklausos: skaityti, žymėti perskaityta, archyvuoti | Taip | Taip | Taip |
| Keisti tekstus, nuotraukas, paslaugas, atsiliepimus, straipsnius, nustatymus | Ne | Taip | Taip |
| Grąžinti lauką į numatytąją vertę | Ne | Taip | Taip |
| Nustatyti / pakeisti numatytąją vertę | Ne | Ne | Taip |
| Vartotojai ir teisės | Nematoma | Taip | Taip |

Numatytųjų verčių logika lieka tokia, kokios norite: savininkė gali viską perrašyti ir viską ištrinti, ištrynus visada grįžtama į numatytąją vertę, o pačią numatytąją vertę užrakinti gali tik developeris.

## Ką darysime

### 1. Duomenų bazė — rašymą palikti tik savininkui ir developeriui
Šiuo metu visos turinio lentelės (paslaugos, atsiliepimai, straipsniai, puslapių tekstai, nuotraukos, nustatymai) leidžia rašyti bet kuriam darbuotojui, tad ir redaktoriui. Pakeisime taip, kad skaitymas liktų visiems trims, o rašymas — tik savininkui ir developeriui. Užklausų lentelė lieka kaip yra: redaktorius gali jas žymėti ir archyvuoti. Numatytųjų verčių lentelė jau dabar prieinama tik developeriui — nekeičiama.

### 2. Serverio pusė — tas pats patikrinimas
Visose įrašymo, trynimo ir įkėlimo funkcijose darbuotojo patikrinimą pakeisime į savininko patikrinimą. Numatytųjų verčių funkcijos lieka developeriui. Užklausų funkcijos lieka darbuotojui.

### 3. Nuotraukų įkėlimas
Įkėlimo saugyklos taisyklės taip pat susiaurinamos: įkelti ir trinti nuotraukas gali tik savininkas ir developeris, matyti — visi.

### 4. Admin sąsaja — matoma spynelė
Prisijungus redaktoriaus teisėmis:
- viršuje kiekviename redagavimo puslapyje — ramus juostelės pranešimas su spynele: „Peržiūros režimas — keisti gali tik savininkas arba developeris“;
- visi teksto laukai, jungikliai, nuotraukų įkėlimo mygtukai, „Grąžinti numatytąją“, „Pridėti“, „Išsaugoti“ ir „Ištrinti“ mygtukai — neaktyvūs, su spynelės ikona;
- „Vartotojai“ punktas meniu nerodomas (kaip dabar);
- Užklausos veikia įprastai, be jokių apribojimų;
- Apžvalga ir analitika matomos įprastai.

Savininkui viskas atrakinta, išskyrus „Nustatyti kaip numatytąją“ — tas mygtukas matomas tik developeriui (kaip ir dabar nuotraukoms), o savininkas mato tik užrašą, kad numatytąją vertę valdo developeris.

### 5. Vizualinis stilius
Jokių naujų spalvų ar formų — spynelė ir peržiūros juosta naudoja jau esamą Lumidenta paletę, Manrope šriftą ir kortelių stilistiką.

## Techninės detalės

- Migracija: turinio lentelėms (`services`, `testimonials`, `posts`, `page_text`, `page_media`, `site_settings`) „Staff manage“ politikos keičiamos į `is_owner(auth.uid())`; pridedamos atskiros `SELECT` politikos su `is_staff(auth.uid())`, kad redaktorius matytų ir nepublikuotus įrašus. `leads` ir `page_views` nekeičiamos. `page_media_defaults` jau `is_developer`.
- `storage.objects` politikos bucket'ui `site-images`: rašymas/trynimas `is_owner`.
- `src/lib/catalog-admin.functions.ts`, `src/lib/page-content-admin.functions.ts`: rašymo funkcijose `assertStaff` → `assertOwner`; skaitymo funkcijos lieka `assertStaff`. Prireikus `assertOwner` pridedamas į `src/lib/users.server.ts`.
- Sąsajoje `getMyRole` jau grąžina `isOwner`; pridedamas bendras `AdminReadOnlyNotice` komponentas ir `disabled` perdavimas į `PageTextField`, `PageImageSlot` ir katalogo puslapius.

## Patikra prieš laikant baigtu
- Prisijungus redaktoriumi: visi puslapiai matomi, laukai neaktyvūs su spynele, bandymas išsaugoti neįmanomas ir per sąsają, ir tiesiogiai per serverį.
- Prisijungus savininku: viskas redaguojama, „Nustatyti kaip numatytąją“ nematoma.
- Prisijungus developeriu: viskas redaguojama, numatytosios vertės valdomos.
- Užklausos veikia visoms trims rolėms.
