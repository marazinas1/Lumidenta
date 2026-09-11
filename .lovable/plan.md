# Telefonas ir el. paštas techninių darbų lange

## Kodėl dabar nerodo

Techninių darbų langas jau moka rodyti telefoną ir el. paštą — juos ima iš Admin → Nustatymai. Patikrinau: ten telefono ir el. pašto laukai šiuo metu tušti, todėl mygtukai nerodomi, nors tekstas kviečia susisiekti. Kodo klaidos nėra — trūksta įvestų duomenų.

## Ką padarysiu

1. **Kontaktai visada iš Nustatymų.** Techninių darbų lange telefonas ir el. paštas ir toliau imami iš to, ką Erika įrašo Admin → Nustatymai — įrašius jie iškart atsiranda kaip paspaudžiami mygtukai (skambinti / rašyti).
2. **Tekstas prisitaiko.** Jei nei telefono, nei el. pašto nėra, pagrindinis sakinys nebeminės „susisiekite telefonu arba el. paštu" — rodys neutralų „Netrukus grįšime". Jei yra tik vienas iš jų — minės tik jį. Taip niekada nebus tuščio pažado.
3. **Priminimas admin panelėje.** Nustatymuose prie techninių darbų jungiklio atsiras įspėjimas, jei telefonas arba el. paštas neįvesti: „Lankytojai nematys kontaktų — įrašykite telefoną ir el. paštą."

## Ko reikės iš Jūsų

Man reikia tikro Erikos telefono ir el. pašto — savo nuožiūra jų neišgalvosiu. Kai atsiųsite, galiu iš karto įrašyti į Nustatymus (arba tai padarys Erika pati).

## Techninė dalis

- `src/components/site/MaintenanceScreen.tsx`: numatytoji žinutė sudaroma pagal tai, ar `settings.phone` / `settings.email` užpildyti; kontaktų mygtukai lieka tie patys.
- `src/routes/_authenticated/admin.settings.tsx`: prie techninių darbų skilties — įspėjimas, kai kontaktai tušti.
- DB pakeitimų nereikia; laukai `site_settings.phone` ir `email` jau egzistuoja.
