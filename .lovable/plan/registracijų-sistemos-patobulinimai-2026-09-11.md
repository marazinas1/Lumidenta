# Registracijų sistemos patobulinimai

Tikslas: kad Erikai iš pirmo žvilgsnio būtų aišku, kur ką rasti, kas laukia jos sprendimo, o pacientui — kad laiškas tikrai ateis ir kur jo ieškoti.

## 1. Aiškesni meniu pavadinimai

Dabar „Kalendorius“ ir „Užklausos“ abu turi burbuliukus, bet reiškia skirtingus dalykus, ir tai painu.

Siūlymas:
- **Kalendorius** — lieka kalendorius (vizitai laike). Burbuliukas nebeliks.
- **Vizitų užklausos** (naujas atskiras punktas) — sąrašas registracijų, laukiančių patvirtinimo. Burbuliukas rodo, kiek laukia sprendimo. Patvirtinti / atmesti galima tiesiai iš sąrašo, be kalendoriaus.
- **Žinutės** — dabartinės „Užklausos“ (kontaktų formos laiškai) pervadinamos, nes tai ne registracijos, o laisvos formos žinutės. Burbuliukas rodo neperskaitytas.

Meniu „Kasdien“: Apžvalga · Kalendorius · Vizitų užklausos · Žinutės · Darbo laikas · Analitika.

## 2. Aiškesnės spalvos kalendoriuje

Dabar laukiantis ir patvirtintas vizitas skiriasi tik permatomumu — praktiškai nesimato.

- **Laukia patvirtinimo** — baltas fonas, punktyrinis (brūkšniuotas) žalias rėmelis, mažas laikrodžio ženkliukas. Iškart matosi „dar neapsispręsta“.
- **Patvirtintas** — pilnas žalias fonas su tvirtu rėmeliu.
- **Atmestas / neatvyko** — pilkas, perbrauktas.
- **Užimtas laikas (blokas)** — dryžuotas neutralus fonas.
- Legenda virš kalendoriaus atnaujinama pagal šias spalvas.

## 3. Pacientui – aiškesnė komunikacija dėl laiškų

Patvirtinimo laiškas Gmail'e pateko į „Promotions“ (dėl „Unsubscribe“ nuorodos ir laiško struktūros).

- Iš vizito laiškų pašalinama atsisakymo prenumeratos eilutė ir rinkodaros požymiai — tai ne reklama, o operacinis pranešimas; taip Gmail dažniausiai deda į „Primary“.
- Laiško tekstas paprastesnis, be dekoratyvių elementų.
- Formos patvirtinimo lange po užklausos pridedamas įspėjimas: „Patvirtinimo laišką siųsime iš noreply@notify.lumidenta.deerva.com. Jei jo nematote, patikrinkite „Šlamštas“ arba „Promotions“ skiltį.“
- Tas pats sakinys įrašomas ir į pirmąjį (gavimo) laišką.

## 4. Smulkūs patobulinimai

- Vizito užklausos kortelėje admin dalyje matomas gavimo laikas ir kliento pastaba.
- Po patvirtinimo/atmetimo burbuliukas atsinaujina iškart.

## Techninė dalis

- `src/routes/_authenticated/admin.tsx` — meniu punktai, badge logika, naujas maršrutas.
- Naujas `src/routes/_authenticated/admin.requests.tsx` — laukiančių registracijų sąrašas (naudoja esamas `appointments` funkcijas, be DB pakeitimų).
- `admin.inquiries.tsx` — tik pavadinimo/antraštės keitimas, URL lieka.
- `admin.calendar.tsx` + `MonthGrid.tsx` — statusų stiliai ir legenda.
- `src/lib/booking.server.ts` — laiškų turinys ir siuntimo parametrai (be unsubscribe/rinkodaros žymų).
- `src/components/site/BookingDialog.tsx` — įspėjimas apie laišką.

Duomenų bazės pakeitimų nereikia.
