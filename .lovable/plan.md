# Pauzė iki projekto pabaigos: laiškai ir priminimai

## Ką padarysiu, kai patvirtinsi

1. Įsirašysiu į projekto atmintį baigiamųjų darbų sąrašą, kad primintų prieš paleidimą.
2. Prijungsiu pranešimus Erikai į el. paštą apie naujas užklausas ir registracijas (šiandien jos matomos tik admin skydelyje).

## Atsakymai į tavo klausimus

### Ar laiškai gali eiti iš pagrindinio domeno, be „notify“?

Taip — **matomas siuntėjas gali būti `noreply@lumidenta.lt`**, net jei techninis siuntimo domenas lieka `notify.lumidenta.lt`. Gavėjas subdomeno nemato niekur: nei siuntėjo eilutėje, nei atsakymo adrese.

Bet techninis subdomenas vis tiek reikalingas, o jam reikia dviejų NS įrašų. Šiuo metu `notify.lumidenta.lt` jau pridėtas ir laukia DNS:

- TXT `_lovable-email.lumidenta.lt`
- NS `notify.lumidenta.lt` → `ns3.lovable.cloud` ir `ns4.lovable.cloud`

Tai reiškia: Hostingerio kelti į Cloudflare nereikia **tik tuo atveju, jei Hostinger leidžia sukurti NS įrašus subdomenui**. Ankstesnis patikrinimas rodė, kad neleidžia. Trys keliai:

| Variantas | Ką mato Erikos klientai | Ką reikia daryti |
|---|---|---|
| A. Palikti kaip yra | `noreply@notify.lumidenta.deerva.com` | nieko, veikia jau dabar |
| B. NS įrašai Hostingeryje (jei pavyks) | `noreply@lumidenta.lt` | pridėti 1 TXT + 2 NS įrašus |
| C. DNS į Cloudflare (domenas lieka Hostingeryje) | `noreply@lumidenta.lt` | perkelti zoną, paštas nenukenčia jei perkeliami visi MX/SPF/DKIM |

Siūlau prieš sprendžiant tiesiog pabandyti variantą B — Hostingerio DNS redaktoriuje pažiūrėti, ar sąraše yra „NS“ tipas subdomenui. Jei yra, viskas išsisprendžia per 10 minučių ir be Cloudflare.

### Ar reikia Resend?

Ne. Lovable siuntimas jau veikia ir su juo laiškai jau ateina. Resend tos pačios NS problemos neišspręstų — jam reikėtų lygiai tokio pat DNS patvirtinimo.

### Ar Erika jau dabar gauna klientų žinutes į paštą?

Ne, dar ne — ir dėl dviejų skirtingų priežasčių:

- **Registracijos užklausos** — laiškas praktikai jau paruoštas ir išsiunčiamas automatiškai, bet jis eina adresu, įrašytu Nustatymuose. Tas laukas kol kas tuščias, todėl laiškas niekur nekeliauja. Kai tik Erika įrašys savo el. paštą, registracijų pranešimai pradės ateiti be jokių papildomų darbų.
- **Kontaktų formos žinutės** — jos šiuo metu tik įkrenta į valdymo skydelį („Užklausos“), laiško niekam nesiunčia. Tai reikia pridėti — įtraukta į darbų sąrašą žemiau.

## Baigiamųjų darbų sąrašas (įrašysiu į atmintį)

- Siuntėjo domenas: `lumidenta.lt` vietoj `deerva.com` (variantas B arba C)
- Pranešimai Erikai į paštą apie naujas užklausas ir registracijas
- Erikos turinys: kainos, paslaugos, nuotraukos, atsiliepimai, darbo laikas
- Teisinė informacija: pilnas vardas, ASPĮ ir OPL licencijų numeriai
- Paleidimo dieną: išjungti techninių darbų režimą ir atblokuoti indeksavimą (`noindex` + `robots.txt` kartu)
- Po paleidimo: Google Search Console ir Google Business Profile
