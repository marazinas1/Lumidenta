# Kalendoriaus atvaizdavimo patobulinimas

Dabar kalendoriuje matomas tik savaitės tinklelis be mėnesio pavadinimo, o navigacijos mygtukai neatrodo aktyvūs. Sutvarkome orientaciją laike ir pridedame vaizdo pasirinkimą — kaip Google Calendar / Outlook / Cal.com.

## Ką matys Erika

**Viršutinė juosta (viena eilutė, aiški hierarchija)**

- Kairėje — didelis laikotarpio užrašas, kuris visada pasako, kur esame:
  - Diena: „Trečiadienis, 2026 m. rugsėjo 9 d.“
  - Savaitė: „2026 m. rugsėjo 7–13 d.“ (jei savaitė persiveria per du mėnesius — „rugpjūčio 31 – rugsėjo 6 d.“)
  - Mėnuo: „2026 m. rugsėjis“
- Šalia — mygtukai `‹` `Šiandien` `›`. „Šiandien“ ryškesnis ir neaktyvus (pilkas), kai jau žiūrime dabartinį laikotarpį — taip matyti, kad esame „namuose“.
- Dešinėje — vaizdo perjungiklis: **Diena · Savaitė · Mėnuo** (segmentuoti mygtukai, pasirinktas užpildytas Lumidenta žalsva). Pasirinkimas įsimenamas naršyklėje, kad kitą kartą atsidarytų tas pats vaizdas.
- Toliau — „Naujas vizitas“.

**Dienos vaizdas** — vienos dienos stulpelis per visą plotį, valandų tinklelis, dabartinio laiko linija. Patogu telefone ir darbo dieną.

**Savaitės vaizdas** (dabartinis, patobulintas):
- dienų antraštėse — savaitės diena, data ir, jei savaitė persiveria per mėnesį, trumpas mėnesio žymuo (pvz. „1 rugs.“);
- šiandienos stulpelis pažymėtas švelniu fonu, jo data — apskritime;
- nedarbo dienos aiškiai blankesnės, darbo valandos — šviesiai žalsvos (kaip dabar);
- raudona „dabar“ linija per visą tinklelį.

**Mėnesio vaizdas** — klasikinis 7 stulpelių tinklelis nuo pirmadienio. Kiekvienoje dienoje: data, iki 3 įrašų juostelių (laikas + vardas), o jei daugiau — „+2 dar“. Kitų mėnesių dienos blankios. Spustelėjus dieną — pereinama į tos dienos vaizdą; spustelėjus įrašą — atsidaro ta pati redagavimo kortelė kaip dabar.

**Bendra visiems vaizdams**
- Kairėje viršuje po pavadinimu — trumpa spalvų legenda: patvirtintas / laukia patvirtinimo / užblokuotas laikas / atšauktas.
- Telefone vaizdo perjungiklis lieka, bet numatytasis — Diena; savaitės juostelė su dienomis lieka kaip dabar.
- Tempimas pele veikia dienos ir savaitės vaizduose (kaip dabar). Mėnesio vaizde tempimo nėra — tik peržiūra ir atidarymas.

## Kodėl taip

Tai pasaulinis standartas: laikotarpio užrašas kairėje, „šiandien“ + rodyklės šalia, vaizdo perjungiklis dešinėje. Trys vaizdai dengia visus realius poreikius — diena darbui, savaitė planavimui, mėnuo apžvalgai „kada šį mėnesį dirbu“. Mėnesio vaizde vizitai rodomi juostelėmis, o ne taškais, kad iš karto matytųsi laikas.

## Techninė dalis

- `src/routes/_authenticated/admin.calendar.tsx`: įvedamas `view: "day" | "week" | "month"` ir `anchor: Date`; navigacija skaičiuoja žingsnį pagal vaizdą (±1 diena / ±7 dienos / ±1 mėnuo). Vaizdas saugomas `localStorage`.
- Esamas savaitės tinklelis iškeliamas į `TimeGrid` komponentą, priimantį dienų masyvą — dienos vaizdas yra tas pats tinklelis su viena diena, todėl tempimo logika nesidubliuoja.
- Naujas `MonthGrid` komponentas (tik skaitymui) tame pačiame kataloge `src/components/admin/calendar/`.
- `src/lib/schedule.ts`: pridedami `startOfMonth`, `monthGridDays`, `formatMonthYear`, `formatRangeLabel` — lietuviški mėnesių linksniai jau yra `formatDayLabel` viduje, pernaudojami.
- Užklausos `from`/`to` skaičiuojami pagal matomą laikotarpį (mėnesio vaizde — visas tinklelis su gretimų mėnesių dienomis), todėl serverio funkcijų keisti nereikia.
- Stiliai — esami Lumidenta žetonai, Manrope, apvalinimai. Naujų spalvų neįvedame; „dabar“ linija naudoja `destructive` žetoną.
