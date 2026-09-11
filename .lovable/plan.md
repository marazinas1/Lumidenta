# Du klausimai: techninių darbų režimas ir laiškų domenas

## 1. Techninių darbų režimas — jis VEIKIA

Patikrinau gyvą `lumidenta.lt`: puslapis lankytojui grąžina užrašą „Svetainė laikinai atnaujinama". Nustatymas įjungtas ir įrašytas šiandien 10:23.

Jūs matote įprastą svetainę todėl, kad esate prisijungęs — taip ir suprojektuota: prisijungę Jūs ir Erika toliau matote realią svetainę ir galite dirbti, o svečiai mato pranešimą.

Patikrinti galima atsidarius `lumidenta.lt` inkognito lange.

Nieko taisyti nereikia. Vienintelis siūlomas patobulinimas (jei norite): prisijungusiam rodyti nedidelę juostelę viršuje „Techninių darbų režimas įjungtas — svečiai svetainės nemato", kad nekiltų abejonių. Pasakykite, jei norite.

## 2. Laiškai iš lumidenta.lt — Hostinger negali

Hostingeris neleidžia kurti NS įrašų subdomenui, o būtent to reikia, kad Lovable galėtų valdyti `notify.lumidenta.lt` pašto įrašus. Apeiti to Hostingeryje nėra kaip — tai jų DNS apribojimas, ne mūsų nustatymas.

### Skubu: grąžinti veikiantį siuntėją

Praeitame žingsnyje jau perjungiau kodą į `notify.lumidenta.lt`. Kadangi šis domenas nepatvirtintas, laiškai (pakvietimai, slaptažodžio atstatymas) dabar neišeitų. Pirmas darbas — grąžinti siuntėją į veikiantį `notify.lumidenta.deerva.com`, kad viskas vėl siųstųsi. Svetainės adresai laiškuose lieka `lumidenta.lt`.

### Trys tolesni keliai

**A. Palikti kaip yra (jokių DNS pakeitimų)**
Laiškai eina iš `Lumidenta <noreply@notify.lumidenta.deerva.com>`. Gavėjas mato vardą „Lumidenta", bet adrese lieka „deerva". Veikia šiandien, nieko daryti nereikia.

**B. DNS perkelti į Cloudflare (domenas lieka Hostingeryje)**
Registratorius nesikeičia — keičiasi tik kas aptarnauja DNS. Tada `notify.lumidenta.lt` veikia, laiškai eina iš Erikos domeno. Reikia vienkartinio DNS perkėlimo ir tikslaus visų dabartinių įrašų (svetainė, paštas, SPF/DKIM/DMARC) perkėlimo. Jūs sakėte, kad kol kas to nenorite.

**C. Domeną perkelti į Lovable**
Tada DNS tvarko Lovable ir pašto domenas susikonfigūruoja automatiškai. Bet keičiasi registratorius, o Erikos paštą reikėtų perkelti atsargiai — rizikingiausias variantas šiuo metu.

### Rekomendacija

Dabar — variantas A: grąžinti veikiantį siuntėją ir eiti toliau (turinys, SEO). Prie „laiškai iš lumidenta.lt" grįžti vėliau, ramiai, kai Erika bus pasiruošusi DNS perkėlimui (variantas B) — tada tai truks apie 15 min ir nieko nesulaužys.

## Techninė dalis

- `src/lib/notifications.server.ts` — `SENDER_DOMAIN` atgal į `notify.lumidenta.deerva.com`
- `src/routes/lovable/email/auth/webhook.ts` — `SENDER_DOMAIN`, `FROM_DOMAIN` atgal į `notify.lumidenta.deerva.com`; `ROOT_DOMAIN` lieka `lumidenta.lt` (nuorodos laiškuose į naują domeną)
- `src/routes/lovable/email/auth/preview.ts` — `ROOT_DOMAIN` lieka `lumidenta.lt`
- `src/pages/straipsniai.tsx` — `SITE` lieka `https://lumidenta.lt`
- Nepatvirtintą `notify.lumidenta.lt` pašto domeną galima palikti laukiantį arba pašalinti — jis nieko negadina
