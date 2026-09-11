# Laiškai iš lumidenta.lt (be deerva)

Šiandien laiškai siunčiami iš `noreply@notify.lumidenta.deerva.com`. Kad siuntėjas būtų Erikos domenas, reikia prijungti naują siuntimo domeną `notify.lumidenta.lt` ir perjungti į jį visą siuntimą.

## Kodėl subdomenas `notify.lumidenta.lt`, o ne tiesiog `lumidenta.lt`
Erikos pašto dėžutė (MX, SPF, DKIM Hostingeryje) veikia ant `lumidenta.lt`. Naudojant atskirą siuntimo subdomeną, jos paštas lieka nepaliestas ir sisteminiai laiškai nekenkia domeno reputacijai. Siuntėjas atrodys `Lumidenta <noreply@notify.lumidenta.lt>` — be „deerva".

## Žingsniai

1. Atidaryti el. pašto domenų nustatymą ir pridėti `notify.lumidenta.lt`.
2. Gautus DNS įrašus (SPF/DKIM/DMARC/verifikacija) suvesti Hostingeryje. Esamų `lumidenta.lt` MX, SPF, DKIM, DMARC įrašų neliesti — nauji įrašai eina tik `notify` subdomenui.
3. Palaukti patvirtinimo (paprastai iki kelių valandų).
4. Kai domenas patvirtintas — perjungiu siuntimą kode.
5. Testas: išsiunčiu pakvietimą ir slaptažodžio atstatymą, patikrinu siuntėjo adresą ir kad laiškas nekrenta į šlamštą.

## Techninė dalis (po patvirtinimo)

- `src/lib/notifications.server.ts` — `SENDER_DOMAIN` → `notify.lumidenta.lt`
- `src/routes/lovable/email/auth/webhook.ts` — `SENDER_DOMAIN`, `FROM_DOMAIN` → `notify.lumidenta.lt`; `ROOT_DOMAIN` → `lumidenta.lt`
- `src/routes/lovable/email/auth/preview.ts` — `ROOT_DOMAIN` → `lumidenta.lt`
- `src/pages/straipsniai.tsx` — `SITE` → `https://lumidenta.lt` (nesusiję su paštu, bet tas pats likutis)
- Perdiegti `auth-email-hook`, kad autentifikacijos laiškai eitų per naują siuntėją

## Ko nedarome
- Nekeičiame Erikos pašto įrašų ant `lumidenta.lt`.
- Nekeičiame siuntimo, kol naujas domenas nepatvirtintas — kitaip laiškai nustotų eiti.
