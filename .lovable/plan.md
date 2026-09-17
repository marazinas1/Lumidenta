# Paslaugų turinio struktūra ir vienodas viešų puslapių plotis

## Tikslas

Padaryti visų paslaugų puslapius aiškius lankytojui ir patogius Erikai pildyti, o viešuose puslapiuose naudoti vienodą, erdvų Lumidenta išdėstymą.

## Ką patvirtinau

- Paslaugos dabar turi vieną `includes` sąrašą, o administravime jis pildomas bendrame teksto lauke „po vieną eilutėje“.
- „Terapinis dantų gydymas“ pirmasis sąrašo įrašas yra „Kada verta kreiptis?“, todėl viešame puslapyje jis klaidingai rodomas su tokia pačia varnele kaip atsakymai.
- Atskiro teksto prieš registracijos mygtuką paslaugos duomenyse dabar nėra.
- Visos viešos skiltys jau naudoja bendrą 1340 px konteinerį, tačiau paslaugos ir straipsnio tekstas papildomai apribotas iki 68 ženklų pločio, todėl dideliame ekrane puslapis atrodo neišnaudotas.

## Įgyvendinimas

### 1. Aiški paslaugos turinio struktūra

Kiekvienai paslaugai pridėsiu du atskirus, neprivalomus laukus:

- **Sąrašo antraštė** — pavyzdžiui, „Kada verta kreiptis?“;
- **Trumpa žinutė prieš registraciją** — pavyzdžiui, Erikos pateiktas sakinys apie ankstyvą danties pažeidimo pastebėjimą.

Esamas atsakymų sąrašas liks atskiras. Tušti blokai viešame puslapyje nebus rodomi.

### 2. Patogus sąrašo redagavimas administravime

Vietoje vieno bendro teksto lauko bus aiškus sąrašo redaktorius:

- kiekvienas atsakymas — atskirame įvedimo laukelyje;
- mygtukas **„Pridėti punktą“** su pliuso ženklu;
- galimybė pašalinti konkretų punktą;
- punktus bus galima perkelti aukštyn ir žemyn;
- aiškūs pavadinimai ir trumpi paaiškinimai, kad Erika matytų, kur rašoma antraštė, kur atsakymai, o kur papildoma žinutė.

Tai bus ta pati logika visoms esamoms ir būsimoms paslaugoms.

### 3. Paslaugos puslapio vaizdas

Po pilno aprašymo bus atskiras švelniai žalias blokas:

1. antraštė „Kada verta kreiptis?“ be varnelės, su atskiru neutraliu teminiu ženklu;
2. po ja — tikrieji atsakymai su varnelėmis, plačiame ekrane išdėstyti dviem stulpeliais, telefone vienu;
3. žemiau — atskiras ramus informacinis blokas su papildoma žinute;
4. po jo — registracijos veiksmai.

Mygtukas **„Registruotis vizitui“** ves į veikiančią registracijos skiltį, o ne bendrą kontaktų puslapį. Vizualas remsis Erikos atsiųstu pavyzdžiu, bet naudos esamas Lumidenta spalvas, šriftus, tarpus ir kampų stilių.

### 4. Dabartinio terapinio gydymo turinio sutvarkymas

- „Kada verta kreiptis?“ bus išimta iš varnelių sąrašo ir perkelta į atskirą antraštės lauką.
- Šeši Erikos pateikti atvejai liks atskirais sąrašo punktais.
- Prieš registracijos mygtuką įrašysiu jos pateiktą sakinį.
- Kitų paslaugų nauji laukai liks tušti, kol Erika juos užpildys; tušti blokai nepaliks bereikalingų tarpų.

Duomenų bazės migracija keis tik struktūrą. Konkretų Erikos turinį įrašysiu atskirai, kad klientės tekstas nepatektų į struktūrinę migraciją.

### 5. Vienodas viešų puslapių plotis

Peržiūrėsiu visus viešus puslapius: pradžią, paslaugų sąrašą ir detales, straipsnių sąrašą ir detales, apie, kainas, kontaktus, registraciją bei teisinius puslapius.

Taikysiu vieną taisyklę:

- sekcijos ir jų fonai eina per visą puslapio plotį;
- vidinis turinys lygiuojamas į tą patį 1340 px Lumidenta konteinerį ir vienodus kraštinius tarpus;
- kortelės, nuotraukos ir struktūriniai blokai išnaudoja visą galimą plotį;
- ilgos straipsnių ir paslaugų pastraipos išlaiko patogų skaitymo eilutės ilgį, bet bus įkomponuotos į platesnę kompoziciją, kad šalia neliktų atsitiktinės tuščios erdvės;
- pašalinsiu vietinius, tarpusavyje nesutampančius pločio ir tarpų sprendimus.

Straipsnio viršelis ir turinio zona bus išplėsti iki bendros puslapio kompozicijos; pats tekstas nebus ištemptas per 1340 px, nes tai pablogintų skaitomumą.

## Techninės detalės

- Struktūrinė migracija papildys `services` dviem tekstiniais laukais; esami RLS ir leidimai nesikeis, nes nauja lentelė nekuriama.
- Bus atnaujinti paslaugų tipai, viešas katalogo užkrovimas, administravimo validacija ir forma.
- Sąrašo duomenys ir toliau bus saugomi struktūruotai kaip masyvas, ne kaip viena suklijuota teksto eilutė.
- Paslaugos ir straipsnio detalių puslapiai gaus atskiras semantines išdėstymo klases; bendras `wrap` liks vienintelis kraštų standartas.

## Patikrinimas

- Erikos savininkės teisėmis: pridėti, pervadinti, perrikiuoti ir pašalinti punktą, išsaugoti antraštę bei papildomą žinutę.
- Viešai patikrinti „Terapinis dantų gydymas“ puslapį ir bent vieną paslaugą su tuščiais naujais laukais.
- Patikrinti straipsnio ir paslaugos puslapius plačiame ekrane bei telefone: vienodi kraštai, nėra horizontalaus slinkimo, tekstas skaitomas, niekas nepersidengia.
- Patikrinti visus viešus maršrutus ir pagrindines nuorodas po pločio suvienodinimo.
