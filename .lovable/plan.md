# Kad Erika galėtų pati redaguoti visus svetainės tekstus

## Ką radau

- Erikos teisės tvarkoje: paskyra turi „Savininkas" rolę ir pagal taisykles gali keisti visus tekstus.
- Duomenų bazėje nėra nė vieno jos išsaugoto teksto — visi įrašai iš rugsėjo 10 d. yra mano.
- „Apie", „Pradžia" ir „Kontaktai" tekstų redagavimas paslėptas kaip skirtukai giliai po **Nustatymai**. Šoniniame meniu, skiltyje „Turinys", yra tik Paslaugos, Kainos, Atsiliepimai, Straipsniai — todėl „apie mane" ji tiesiog neranda.
- Laukeliai atrodo užpildyti, bet iš tikrųjų yra tušti: dabartinis tekstas rodomas tik kaip pilkas šešėlinis užrašas. Mygtukas „Išsaugoti" tol neaktyvus (pilkas), kol nieko neįrašyta — taip ir atrodo jos ekrane. Iš šalies tai atrodo kaip „negaliu koreguoti, niekas nereaguoja".

## Ką padarysiu

1. **Tekstų puslapiai atsiras šoniniame meniu.** Skiltyje „Turinys" pridedu: Pradžios puslapis, Apie, Kontaktai. Seni adresai po Nustatymais veiks toliau (nukreipimai), kad niekas nesulūžtų.
2. **Dabartinis tekstas lieka matomas laukelyje kaip švelniai papilkėjęs užrašas**, kurį galima perrašyti savo — bet jis daromas žymiai blankesnis (nei paprastas tekstas, panašiai kaip šešėlinis), kad intuityviai atrodytų „rašyk ant viršaus".
3. **Prielaida paaiškinama tiesiogiai:** šalia laukelio arba jame rodoma užuomina, pvz. „Rašykite čia — dabartinis tekstas pakeisis jūsų" arba laukelio apačioje „Palikite tuščią, jei norite numatytojo teksto". Įvedus bet kokį simbolį, tekstas tampa pilnai tamsus — aišku, kad tai dabar yra jūsų tekstas.
4. **Aiški laukelio būsena:** „Numatytasis" arba „Pakeista", o šalia — „Grąžinti numatytąjį".
5. **Mygtukas visada matomas ir suprantamas:** neaktyvus tik tada, kai nieko nepakeista, su paaiškinimu „Pakeiskite tekstą, kad galėtumėte išsaugoti"; išsaugojus — aiškus patvirtinimas.
6. **Patikrinsiu gyvai jos teisėmis**, kad įrašymas tikrai suveikia ir pakeitimas iškart matomas svetainėje (ne tik pranešimas „Išsaugota").
7. Trumpa instrukcija Erikai lietuviškai — kur dabar ką rasti.

## Techninės detalės

- `src/routes/_authenticated/admin.tsx` — „Turinys" grupė papildoma trimis nuorodomis į esamus `/admin/settings/pages/*` maršrutus (arba naujus `/admin/website/*` aliasus su nukreipimais).
- `src/components/admin/PageTextField.tsx` — `draft` inicijuojamas `value || fallback`, tuščias laukelis traktuojamas kaip „grąžinti numatytąjį"; pridedama būsenos žymė ir disabled paaiškinimas.
- Serverio pusė (`saveText`, RLS `is_owner`) nekeičiama — ji jau leidžia savininkui rašyti; patikrinimą darysiu Playwright'u prisijungus savininko sesija.
