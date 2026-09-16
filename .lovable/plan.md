# Kad Erika galėtų pati redaguoti visus svetainės tekstus

## Ką radau

- Erikos teisės tvarkoje: paskyra turi „Savininkas" rolę ir pagal taisykles gali keisti visus tekstus.
- Duomenų bazėje nėra nė vieno jos išsaugoto teksto — visi įrašai iš rugsėjo 10 d. yra mano.
- „Apie", „Pradžia" ir „Kontaktai" tekstų redagavimas paslėptas kaip skirtukai giliai po **Nustatymai**. Šoniniame meniu, skiltyje „Turinys", yra tik Paslaugos, Kainos, Atsiliepimai, Straipsniai — todėl „apie mane" ji tiesiog neranda.
- Laukeliai atrodo užpildyti, bet iš tikrųjų yra tušti: dabartinis tekstas rodomas tik kaip pilkas šešėlinis užrašas. Mygtukas „Išsaugoti" tol neaktyvus (pilkas), kol nieko neįrašyta — taip ir atrodo jos ekrane. Iš šalies tai atrodo kaip „negaliu koreguoti, niekas nereaguoja".

## Ką padarysiu

1. **Tekstų puslapiai atsiras šoniniame meniu.** Skiltyje „Turinys" pridedu: Pradžios puslapis, Apie, Kontaktai. Seni adresai po Nustatymais veiks toliau (nukreipimai), kad niekas nesulūžtų.
2. **Laukeliai bus iš karto užpildyti tikru tekstu**, kurį lankytojas mato svetainėje — ne pilku šešėliu. Erika galės tiesiog taisyti esamą sakinį.
3. **Aiški laukelio būsena:** „Numatytasis" arba „Pakeista", o šalia — „Grąžinti numatytąjį".
4. **Mygtukas visada matomas ir suprantamas:** neaktyvus tik tada, kai nieko nepakeista, su paaiškinimu „Pakeiskite tekstą, kad galėtumėte išsaugoti"; išsaugojus — aiškus patvirtinimas.
5. **Patikrinsiu gyvai jos teisėmis**, kad įrašymas tikrai suveikia ir pakeitimas iškart matomas svetainėje (ne tik pranešimas „Išsaugota").
6. Trumpa instrukcija Erikai lietuviškai — kur dabar ką rasti.

## Techninės detalės

- `src/routes/_authenticated/admin.tsx` — „Turinys" grupė papildoma trimis nuorodomis į esamus `/admin/settings/pages/*` maršrutus (arba naujus `/admin/website/*` aliasus su nukreipimais).
- `src/components/admin/PageTextField.tsx` — `draft` inicijuojamas `value || fallback`, tuščias laukelis traktuojamas kaip „grąžinti numatytąjį"; pridedama būsenos žymė ir disabled paaiškinimas.
- Serverio pusė (`saveText`, RLS `is_owner`) nekeičiama — ji jau leidžia savininkui rašyti; patikrinimą darysiu Playwright'u prisijungus savininko sesija.
