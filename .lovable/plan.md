# Perkėlimas ant lumidenta.lt: patikra, paleidimas ir likę darbai

## DNS patikra — viskas tvarkoje

Patikrinau viešuosius įrašus, abu adresai patvirtinti ir aktyvūs:

- `lumidenta.lt` — A įrašas rodo į 185.158.133.1, patvirtinimo TXT sutampa
- `www.lumidenta.lt` — A įrašas ir `_lovable.www` TXT sutampa
- Pašto įrašai (MX, SPF, DKIM x3, DMARC, autodiscover/autoconfig) ir Google patvirtinimas liko nepaliesti — paštas veiks kaip veikęs
- Senų WordPress įrašų nebeliko

Vienintelis likęs niuansas: pagrindiniu domenu vis dar nustatytas `lumidenta.deerva.com`, todėl `lumidenta.lt` kol kas nukreipia į jį. Reikia perjungti pagrindinį domeną.

## Ką darome iš eilės

1. Projekto nustatymuose → Domenai: `lumidenta.lt` pažymėti kaip pagrindinį (Set as primary). Tada `www` ir senasis adresas nukreips į jį.
2. Publishinti projektą.
3. Įjungti techninių darbų režimą per Admin → Nustatymai.
4. Patikrinti, kad `lumidenta.lt` atidaro Lumidenta puslapį (ne senąjį WordPress), o svečias mato techninių darbų pranešimą.

## Atsakymai į klausimus

**Ar Erika galės pati įjungti/išjungti?** Taip. Jungiklis Admin → Nustatymai viršuje, prieinamas savininkui ir developeriui. Redaktorius jį mato, bet paspausti negali.

**Ar jai reikia liesti DNS?** Ne, niekada. Režimas keičiamas tik jungikliu.

**Ar SEO dabar?** Ne. Kol nėra suvestos kainų ir tikro turinio, indeksavimą laikome išjungtą. Kol veikia techninių darbų režimas, puslapis pats siunčia „neindeksuoti“ nurodymą; papildomai paliksiu ir bendrą paieškos blokavimą, kurį nuimsime vienu žingsniu paleidimo dieną.

## Kas dar liko iki pilno paleidimo

Iš Erikos pusės (turinys):
- Kainoraštis — realios kainos vietoj laikinų pavyzdžių
- Paslaugų aprašymai ir jų tvarka
- Tekstas „Apie mane“ + tikra nuotrauka
- Nuotraukos iš kabineto (vietoj vietos rezervavimo rėmelių)
- Atsiliepimai — realūs vietoj laikinų
- Darbo valandos kalendoriuje
- Patvirtintas pilnas vardas, OPL licencijos nr. ir ASPĮ licencijos nr.

Iš mūsų pusės (techninė dalis):
- El. laiškų siuntėją perkelti nuo `notify.lumidenta.deerva.com` prie `lumidenta.lt` (nauji DNS įrašai pašto siuntimui)
- Nuorodos laiškuose ir kanoninis adresas jau nustatyti į `lumidenta.lt` — patikrinti gyvai
- SEO paleidimas: nuimti indeksavimo bloką, sitemap, Google Search Console, Google verslo profilis
- Struktūriniai duomenys (odontologijos praktika, adresas, darbo laikas) — tik su patvirtintais duomenimis
- Privatumo politika ir taisyklės — peržiūrėti pagal realius kontaktus
- Galutinis greičio ir mobilios versijos patikrinimas prieš indeksavimą

## Techninė dalis

- Domeno pirmumas keičiamas Project Settings → Domains → ⋯ → Set as primary; DNS keisti nereikia.
- Techninių darbų būsena saugoma `site_settings.maintenance_mode` / `maintenance_message`; rašymą riboja ta pati `assertOwner` taisyklė kaip kitiems nustatymams.
- Įjungus, viešasis maketas pakeičiamas `MaintenanceScreen`; `/admin`, `/auth`, `/reset-password` lieka pasiekiami, prisijungęs naudotojas mato įprastą svetainę.
- `public/robots.txt` grąžinamas į blokuojantį variantą iki paleidimo dienos, tada nuimamas kartu su likusiais SEO žingsniais.
