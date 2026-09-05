# El. laiškų domenas: DNS jau tvarkoje, liko patvirtinimas

## Situacija

Patikrinau viešuosius DNS įrašus — po perkėlimo į Cloudflare viskas matoma teisingai:

- `deerva.com` nameserveriai jau rodo į Cloudflare
- `notify.lumidenta.deerva.com` NS įrašai rodo į `ns5.lovable.cloud` ir `ns6.lovable.cloud`
- patvirtinimo TXT įrašas matomas su teisinga reikšme

Vadinasi, iš Tavo pusės viskas padaryta. Lovable pusėje domeno būsena kol kas dar „tikrinama" — tikrinimas paleidžiamas periodiškai, todėl reikia truputį palaukti.

Būtent dėl to iki šiol neatėjo pakvietimas: kol siuntėjo domenas nepatvirtintas, laiškai neišsiunčiami. HA projekte laiškai eina numatytuoju Lovable siuntėju, todėl ten viskas veikia iš karto.

## Ką darome

1. Palaukti kelias minutes ir patikrinti domeno būseną iš naujo. Jei nepasikeičia — paspausti „Verify domain" skiltyje Cloud → Emails.
2. Kai būsena tampa aktyvi, iš naujo išsiųsti pakvietimą į `marius@deerva.com`.
3. Patikrinti siuntimo įrašus, ar laiškas tikrai išėjo, ir patvirtinti, kad atėjo į paštą.
4. Jei per ~1 val. patvirtinimas vis tiek neįvyktų, laikinai išjungti firminį siuntimą, kad pakvietimai eitų numatytaisiais Lovable laiškais, ir įjungti atgal po patvirtinimo.

## Ko iš Tavęs reikia

Nieko — DNS dalis baigta. Tik pranešk, jei nori, kad pakvietimą Erikai išsiųsčiau iš karto po patvirtinimo.

## Techninė dalis

- Šablonai `src/lib/email-templates/` ir auth webhook `src/routes/lovable/email/auth/webhook.ts` jau paruošti, kodo keisti nereikia.
- Po patvirtinimo laiškai eis iš `Lumidenta <noreply@notify.lumidenta.deerva.com>`.
- Atsarginis variantas — `toggle_project_emails` su `enabled: false`, grąžinantis numatytuosius Lovable šablonus.
