# Analitikos patobulinimas: šalys, botų filtras, kokybiški lankytojai

Šiandien analitika skaičiuoja kiekvieną puslapio atidarymą kaip lygiavertį – įskaitant robotus ir 1–3 sekundžių „atsitiktinius“ apsilankymus. Nerodoma, iš kurios šalies ateina žmonės. Sutvarkome pagal tai, kaip tai daro Plausible/Fathom (privatumą gerbianti analitika be slapukų).

## Ką matys Erika

- **Šalys** – sąrašas su vėliavėlėmis: Lietuva, Jungtinė Karalystė, Vokietija ir t. t. (miestai nerenkami – nereikia ir nedera medicinos svetainėje).
- **Realūs lankytojai** – apsilankymas užskaitomas tik jei žmogus svetainėje išbuvo bent 5 sekundes arba ką nors paspaudė / paslinko. Trumpi „šoktelėjimai“ ir robotai nebeteršia skaičių.
- **Nauji rodikliai:**
  - Vidutinė apsilankymo trukmė
  - Atmetimo rodiklis (kiek žmonių peržiūrėjo tik vieną puslapį)
  - Puslapių vienam lankytojui
  - Konversija į užklausas / registracijas (jau yra, lieka)
- **Filtro jungiklis** „Rodyti ir trumpus apsilankymus“ – pagal nutylėjimą išjungtas, bet norint galima pamatyti viską.
- Prie kiekvienos kortelės trumpas paaiškinimas lietuviškai, ką skaičius reiškia.

## Kaip filtruojami robotai

Trys sluoksniai, kaip įprasta rinkoje:

1. **Žinomų robotų sąrašas** pagal naršyklės parašą (Googlebot, bingbot, AhrefsBot, Semrush, uptime tikrintuvai, headless naršyklės ir pan.) – toks apsilankymas net neįrašomas.
2. **Įsitraukimo sąlyga** – įrašas fiksuojamas ne iškart, o po 5 s buvimo puslapyje arba po pirmo paslinkimo / paspaudimo. Dauguma paprastų skriptų iki to nepriauga.
3. **Serverio pusė** – peržiūra registruojama per svetainės serverį, todėl matome tikrą šalies kodą ir galime atmesti duomenų centrų / akivaizdžiai automatinį srautą. Personalo (prisijungusių) apsilankymai neskaičiuojami.

## Rekomendacijos (pagal geriausią praktiką)

- Neteršti duomenų prieš paleidimą: dabartiniai testiniai įrašai bus pažymėti kaip „iki paleidimo“ ir neįtraukiami į skaičius.
- Nerinkti IP adresų ir tikslių vietų – laikome tik šalies kodą, kad liktų BDAR draugiška ir nereikėtų slapukų juostos.
- Vėliau, kai svetainė bus indeksuojama, prisijungti Google Search Console – ji parodo paieškos užklausas, ko pati analitika neparodo.
- Sekti ne tik lankytojus, o veiksmus: paspaudimai ant telefono numerio, „Registruotis“ mygtuko, formos išsiuntimo – tai realus verslo rodiklis.
- Duomenis saugoti 14 mėnesių ir senesnius automatiškai valyti.

## Techninė dalis

**Duomenų bazė (viena migracija):**
- `page_views` papildoma: `country_code text`, `engaged boolean default false`, `duration_ms int`, `is_bot boolean default false`, `entry boolean`, indeksai pagal `created_at`, `country_code`.
- Naujas įrašymo kelias – RPC arba serverio maršrutas; `anon` INSERT tiesiai į lentelę atšaukiamas, kad iš išorės nebūtų galima kišti šiukšlių.
- `analytics_summary` perrašoma: prideda `countries`, `avg_duration`, `bounce_rate`, `pages_per_visit`; visi skaičiai pagal nutylėjimą filtruoja `is_bot = false AND engaged = true`; naujas parametras `_include_short boolean default false`.
- Valymo funkcija senesniems nei 14 mėn. įrašams.

**Serveris:**
- `src/routes/api/public/pv.ts` – POST endpointas: nuskaito `cf-ipcountry` (fallback `x-vercel-ip-country`), tikrina `user-agent` prieš robotų sąrašą (`src/lib/bot-detect.ts`), validuoja Zod, įrašo per service-role klientą. IP nesaugomas.
- Paprasta apsauga nuo užtvindymo: sesijos + kelio limitas per minutę.

**Klientas:**
- `src/lib/page-view-tracking.ts` perrašomas: `sendBeacon` į naują endpointą po 5 s / pirmo `scroll`/`click`, plius `visibilitychange` metu siunčiama trukmė. Personalo sesijos praleidžiamos.

**Admin UI (`admin.settings.analytics.tsx`):**
- Naujos kortelės (trukmė, atmetimo rodiklis, puslapiai/lankytoją), „Šalys“ blokas su vėliavėlėmis šalia „Šaltiniai“ ir „Įrenginiai“, jungiklis trumpiems apsilankymams, paaiškinimai.
