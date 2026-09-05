# Facebook nuoroda poraštėje + straipsnių skiltis

## 1. Facebook ikona poraštėje

Poraštėje (šalia logotipo eilutės) atsiranda apvali Facebook ikona, tokia pat kalba kaip kiti svetainės elementai: plonas kontūras, apvalus kraštas, sodrus per užvedimą — jokių naujų spalvų ar formų.

Nuoroda imama iš Nustatymų lauko „Facebook nuoroda" (jis jau yra admin panelėje), o kol jis tuščias, naudojamas Erikos puslapis:
`https://www.facebook.com/profile.php?id=61557528596416`. Reikšmę įrašysiu į Nustatymus, kad Erika bet kada galėtų ją pakeisti pati. Nuoroda atsidaro naujame lange.

Jei Nustatymuose nuoroda ištrinama — ikona tiesiog nerodoma.

## 2. Straipsniai (blogas)

Taip, verta. Erika jau rašo tekstus Facebooke, o paslaugų puslapiai vieni patys apima tik siaurą paieškos žodžių ratą. Straipsniai leidžia atsakyti į tai, ko žmonės realiai ieško („ar skauda šalinant dantų akmenis", „kiek laiko laikosi balinimas"), duoda šviežio turinio ir vidinių nuorodų į paslaugas. Tai ilgesnio laiko darbas, ne greitas efektas, bet odontologijos srityje tai vienas iš nedaugelio sąžiningų būdų augti paieškoje.

Apimtis (ta pati logika kaip Halliday projekte):

- Nauja lentelė straipsniams: antraštė, nuoroda (slug), santrauka, turinys, viršelio nuotrauka, autorius, publikavimo data, publikuota/juodraštis, SEO antraštė ir aprašymas.
- Admin skiltis „Straipsniai" po „Svetainė": sąrašas, kūrimas, redagavimas, nuotraukos įkėlimas per tą patį optimizavimo kelią, publikuoti/slėpti, trinti.
- Vieši puslapiai: `/straipsniai` (sąrašas, tos pačios kortelės kaip visur) ir `/straipsniai/$slug` (pilnas straipsnis, sava SEO metadata, canonical, Article struktūriniai duomenys, nuoroda atgal).
- Nuoroda „Straipsniai" viršutiniame meniu ir poraštėje.
- Naujausi 3 straipsniai gali būti rodomi pradžios puslapyje — įjungiama/išjungiama iš admin. (Jei nenori — pasakyk, praleisiu.)
- Turinio neišgalvosiu: sukursiu vieną aiškiai pažymėtą pavyzdinį juodraštį, kad Erika matytų, kaip atrodo forma. Tikrus tekstus rašo ji (arba atsiunti man juos vėliau).

## Techninės detalės

- `posts` lentelė su RLS: vieši skaito tik `published = true`, darbuotojai (developer/owner/editor) valdo viską; GRANT kaip ir kitose lentelėse.
- Skaitymas per esamą `catalog`/serverio funkcijų sluoksnį su SSR loaderiu (`ensureQueryData`), kad turinys būtų HTML'e paieškos robotams.
- Viršeliai — `site-images` bucket, per `image-optimize.ts` (WebP, EXIF pašalinimas, senos nuotraukos trynimas).
- Facebook nuoroda imama iš jau esamo `site_settings.facebook_url`; poraštėje – atsarginė reikšmė kode.
- Svetainė kol kas su `noindex` — straipsniai bus indeksuojami tik po perkėlimo į lumidenta.lt.
