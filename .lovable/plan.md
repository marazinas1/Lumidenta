# Išvalyti senąsias „demo-rentals“ spalvas

Paspaudus įrašą kalendoriuje atsiveriantis langas (ir kiti iššokantys elementai) rodomi ne Lumidenta spalvomis. Priežastis rasta: Lumidenta paletė aprašyta tik `.site-theme` apvalkale, o iššokantys langai (Radix „portal“) piešiami už jo ribų — tiesiai `body` viduje, todėl paima senąsias, iš demo projekto likusias žalsvai mėlynas ir tamsiai mėlynas reikšmes.

## Ką padarysime

- Lumidenta paletė (linen, warm-white, ink, stone, sage, clay) tampa numatytąja visai platformai, o ne tik svetainės apvalkalui.
- Senosios demo spalvų reikšmės pašalinamos visiškai — nei šviesios, nei tamsios versijos nebelieka, todėl jos nebegali niekur „išlįsti“.
- Peržiūrimi visi iššokantys elementai (įrašo redagavimo langas, pasirinkimų sąrašai, kalendorius, patvirtinimo langai, pranešimai) — visi turi atrodyti kaip likusi admin panelė: kreminis fonas, tamsiai grafitinis tekstas, žalsvi akcentai, Manrope šriftas, apvalinti kampai.
- Patikrinsime, ar niekur kitur kode neliko demo laikų spalvų ar stiliaus likučių.

## Techninė dalis

- `src/styles.css`:
  - `:root` bloke esančias senąsias reikšmes (`--primary: oklch(0.6407 0.0671 182.89)` ir kt., įskaitant `--gradient-hero`, `--sidebar-*` teal reikšmes) pakeisti Lumidenta žetonais, tais pačiais, kurie dabar yra `.site-theme` bloke.
  - Pašalinti `.dark` bloką su demo mėlynomis reikšmėmis (tamsi tema projekte nenaudojama).
  - `.site-theme` palikti kaip apvalkalą su šriftu/`focus-visible`, bet spalvų perrašymus sumažinti iki minimumo, kad būtų vienas tiesos šaltinis.
- Patikrinti `@theme` žetonų (`--color-chart-*`, `--color-sidebar-*`) reikšmes ir suderinti diagramų spalvas su Lumidenta palete.
- `rg` paieška visame `src/` dėl likusių `oklch(... 26x)` mėlynų reikšmių, `hsl(222`, `#0a0a0a` tipo kietai įrašytų spalvų ir „dark“ klasės naudojimo.
- Patikra: `tsgo` typecheck, `/admin/calendar`, `/admin/users`, `/` ir `/registracija` atidarymas naršyklėje su atidarytu įrašo redagavimo langu, palyginant spalvas su likusia panele.
