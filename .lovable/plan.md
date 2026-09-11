# Perkėlimas ant lumidenta.lt + „Techninių darbų" jungiklis

## Ką patikrinau Hostinger DNS

Dabartiniai įrašai (vardų serveriai lieka Hostinger: `ns1/ns2.dns-parking.com`):

| Įrašas | Ką daryti |
|---|---|
| `ALIAS @ → lumidenta.lt.cdn.hstgr.net` | **Pašalinti** (tai senoji WordPress svetainė) |
| `CNAME www → www.lumidenta.lt.cdn.hstgr.net` | **Pašalinti** |
| `MX @ mx1/mx2.hostinger.com` | **Palikti** – Erikos paštas |
| `TXT @ v=spf1 ...hostinger...` | **Palikti** |
| 3× `CNAME hostingermail-*._domainkey` | **Palikti** |
| `CNAME autodiscover`, `CNAME autoconfig` | **Palikti** |
| `TXT _dmarc` | **Palikti** |
| `TXT @ google-site-verification=...` | **Palikti** (Erikos Google patvirtinimas) |

Naujai pridedama: `A @ → 185.158.133.1`, `A www → 185.158.133.1` ir patvirtinimo `TXT _lovable` (tikslią reikšmę duos Lovable prijungimo langas).

Paštas nenukenčia – keičiami tik svetainės įrašai.

## Perkėlimo eiga

1. Lovable projekte prijungiu `lumidenta.lt` ir `www.lumidenta.lt` (rodysiu prijungimo korteles pokalbyje).
2. Tu Hostinger panelėje ištrini du senus įrašus ir pridedi tuos, kuriuos parodys kortelė.
3. Palaukiam patvirtinimo ir SSL (paprastai 15 min – kelios valandos).
4. Pagrindiniu domenu nustatau `lumidenta.lt`, `www` ir `lumidenta.deerva.com` peradresuoja į jį.
5. Tik po to, kai domenas gyvas, nuimu draudimą indeksuoti: pašalinu `noindex, nofollow` ir atlaisvinu `robots.txt`, patikrinu `sitemap.xml` ir kanonines nuorodas su nauju adresu.
6. Erikos senoji WordPress svetainė lieka Hostinger'yje nepaliesta – tik nebepasiekiama domenu, todėl bet kada galima grįžti atgal.

## „Techninių darbų" jungiklis (tai, ko klausei)

Taip, tai įmanoma ir padarysiu patogiau nei DNS perjunginėjimas: **vienas jungiklis Admin → Nustatymai**.

- Įjungus – kiekvienas lankytojas mato tvarkingą „Svetainė laikinai atnaujinama" puslapį su telefonu ir el. paštu, kad pacientai vis tiek galėtų susisiekti.
- Tu ir Erika (prisijungę) svetainę matote normaliai, todėl galima ramiai šlifuoti gyvai.
- Išjungus – svetainė grįžta akimirksniu. DNS niekada nekeičiamas.
- Įjungtas režimas taip pat nurodo paieškos sistemoms laikinai neindeksuoti (HTTP 503), kad SEO nenukentėtų.

## Techninė dalis

- Naujas `site_settings` laukas `maintenance_mode` (boolean) + `maintenance_message` tekstas; keisti gali `owner` ir `developer`.
- Serverio pusėje `__root` įkėlimo metu tikrinama reikšmė; neprisijungusiam lankytojui grąžinamas techninių darbų komponentas su `503` ir `Retry-After`, `noindex`. Admin ir `/auth` maršrutai nefiltruojami.
- `SITE_URL` numatytoji reikšmė jau `https://lumidenta.lt`; `APP_BASE_URL` faile `src/lib/app-url.server.ts` keičiamas iš `lumidenta.deerva.com` į `lumidenta.lt` (laiškų nuorodos).
- `src/routes/__root.tsx` – pašalinama `robots: noindex, nofollow`; `public/robots.txt` – leidžiama indeksuoti ir nurodomas sitemap.
- Laiškų siuntėjas kol kas lieka `notify.lumidenta.deerva.com` (jis patvirtintas ir veikia). Vėliau, atskiru žingsniu, galima perkelti į `notify.lumidenta.lt` – tam reikės naujų DNS įrašų Hostinger'yje.

## Ko reikės iš tavęs

Prieigos prie Hostinger DNS tuo momentu, kai parodysiu tikslius įrašus – juos reikia suvesti rankomis, aš pats jų pakeisti negaliu.
