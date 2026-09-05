# Email siuntimas: pakvietimai ir slaptažodžio laiškai

## Kodėl laiškas neatėjo

Šiam projektui dar nėra nustatyto siuntėjo domeno — el. laiškai neturi iš kur išeiti,
todėl pakvietimas į marius@deerva.com nepasiekė nei pašto, nei šlamšto aplanko.
Paskyra pati buvo sukurta sėkmingai (ji matoma vartotojų sąraše), tik laiškas neišsiuntė.
Halliday projekte siuntėjo domenas jau sutvarkytas — todėl ten viskas veikia.

## Ką padarysime

1. **Siuntėjo domenas — deerva.com**
   Paleidžiame el. pašto nustatymo langą ir prijungiame deerva.com kaip laikiną
   siuntėjo domeną. Laiškai eis iš adreso tipo `noreply@notify.deerva.com`.
   Domeno patvirtinimas DNS lygiu gali užtrukti iki kelių valandų (retais atvejais ilgiau).

2. **Lumidenta stiliaus laiškai**
   Sukuriame visų prisijungimo laiškų šablonus ir apipavidaliname juos pagal svetainę:
   Lumidenta logotipas, šalavijo žalia, Manrope šriftas, švelniai suapvalinti mygtukai,
   šilta balta fonas. Apims:
   - pakvietimą naujam vartotojui,
   - slaptažodžio atkūrimą,
   - registracijos patvirtinimą,
   - prisijungimo nuorodą,
   - el. pašto keitimą,
   - pakartotinį tapatybės patvirtinimą.
   Tekstai — lietuvių kalba, be jokių medicininių pažadų ar reklaminio turinio.

3. **Patikrinimas**
   Kai domenas patvirtintas, iš naujo išsiunčiame pakvietimą marius@deerva.com ir
   patikriname, ar laiškas pasiekė paštą.

4. **Perėjimas prie lumidenta.lt**
   Paliekame deerva.com kūrimo laikotarpiui. Kai svetainė keliama į lumidenta.lt,
   tuo pačiu metu perjungiame ir siuntėjo domeną — tai atskiras, vėlesnis žingsnis.

## Ko reikės iš Jūsų

Nustatymo lange reikės patvirtinti deerva.com ir, jei DNS tvarkote patys,
pridėti pora įrašų pas domeno tiekėją — tikslius įrašus parodys tas pats langas.
Kol domenas tikrinamas, jokių kitų veiksmų nereikia.

## Techninės pastabos

- Naudojame Lovable valdomą el. pašto infrastruktūrą (jokių trečiųjų šalių raktų).
- Prisijungimo laiškų šablonai bus `src/lib/email-templates/`, o jų siuntimą tvarkys
  automatiškai sugeneruotas maršrutas — rankinio kodo rašyti nereikia.
- Jokių naujų lentelių ar eilių duomenų bazėje nekuriame.
- Jei bandant pakartotinai pasirodytų 429 klaida, pakelsime valandinę prisijungimo
  laiškų ribą — bet tik po to, kai siuntimas jau veiks.
