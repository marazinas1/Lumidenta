# Kodėl HA projekte pakvietimai ateina, o čia – ne

## Situacija

Halliday Architects projekte pakvietimai siunčiami **numatytaisiais Lovable laiškais** (siuntėjas – Lovable serveriai). Todėl ten nereikia jokių DNS įrašų ir viskas veikia iš karto.

Šiame projekte anksčiau įjungėme **savo firminius laiškus** iš `notify.lumidenta.deerva.com`. Nuo to momento visi prisijungimo ir pakvietimo laiškai bandomi siųsti iš šio adreso, o jis dar nepatvirtintas (trūksta NS įrašų, kurių Hostinger neleidžia sukurti). Rezultatas – laiškas neišsiunčiamas visai, todėl ir negauni pakvietimo.

## Sprendimas

Laikinai grąžinti numatytuosius Lovable laiškus, kad pakvietimai vėl veiktų iš karto – lygiai kaip HA projekte:

1. Išjungti firminį laiškų siuntimą projekte (pakvietimai vėl eis per Lovable siuntėją).
2. Palikti paruoštus lietuviškus laiškų šablonus projekte – jie niekur nedingsta.
3. Pakartotinai išsiųsti pakvietimą į `marius@deerva.com` ir patikrinti, ar ateina.

Vėliau, kai bus sutvarkytas DNS (perkėlus deerva.com DNS į Cloudflare arba perkėlus domeną į Lovable), firminius laiškus vėl įjungsime ir laiškai eis iš Lumidenta vardo su paruoštu dizainu.

## Ką pastebėsi

- Pakvietimai ir slaptažodžio atkūrimo laiškai ateis, bet kol kas be Lumidenta firminio stiliaus ir iš Lovable adreso.
- Jokių pakeitimų svetainėje ar admin panelėje.

## Techninė dalis

- `email_domain--toggle_project_emails` su `enabled: false` – auth laiškai grįžta į numatytuosius Lovable šablonus.
- Šablonai `src/lib/email-templates/` ir auth webhook maršrutas paliekami vietoje, nekeičiami.
- Po DNS patvirtinimo – `enabled: true`, jokio kodo perrašymo nereikės.
