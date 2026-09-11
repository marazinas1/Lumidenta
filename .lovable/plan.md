# Admin meniu pertvarkymas

Tikslas: Erika greitai randa tai, ką naudoja kasdien, o tai, kas nustatoma vieną kartą, gyvena giliau.

## Nauja meniu hierarchija

```text
KASDIEN
  Apžvalga            (santrauka: laukiančios registracijos, užklausos, trumpa analitika)
  Kalendorius         (badge: laukiančios registracijos)
  Užklausos           (badge: neperskaitytos)
  Darbo laikas

TURINYS
  Paslaugos
  Kainos
  Atsiliepimai
  Straipsniai

NUSTATYMAI
  Nustatymai          (tabai viduje)
```

Analitika ir Vartotojai išeina iš pagrindinio meniu – jie tampa tabais Nustatymuose.
Pradžia / Apie / Kontaktai puslapių tekstai taip pat keliauja į Nustatymus (retai keičiami).

## Nustatymų tabai

1. Praktika – pavadinimas, adresas, telefonas, el. paštas, socialiniai tinklai, licencijos (veikia visoje svetainėje: footer, kontaktai, žemėlapis)
2. Išvaizda – logotipas, jo dydis, favicon
3. Puslapių tekstai – vidiniai pogrupiai: Pradžia, Apie, Kontaktai (tekstai + nuotraukos)
4. Analitika
5. Vartotojai (rodoma tik owner/developer)
6. Priežiūra – maintenance režimas

Kiekvienas tabas turi savo URL (pvz. `/admin/settings/pages/home`), kad būtų galima dalintis nuoroda ir kad naršyklės „atgal“ veiktų.

## Sąrašų elgsena

Kainos gauna tą pačią logiką kaip Paslaugos: sąrašas suskleistas, „Redaguoti“ atidaro tik tą įrašą. Tas pats principas – Atsiliepimams ir Straipsniams, kad sąrašai liktų trumpi ir skaitomi.

## Apžvalga

Apžvalgoje viena ekrano dalis su tuo, ko reikia rytą: laukiančios registracijos, naujos užklausos, artimiausios dienos vizitai, trumpa lankomumo santrauka su nuoroda į pilną analitiką.

## Techninė dalis

- `src/routes/_authenticated/admin.tsx` – naujos grupės, badge'ai lieka ties Kalendoriumi ir Užklausomis.
- Nauji maršrutai: `admin.settings.tsx` tampa layout'u su tabų navigacija; vaikai `admin.settings.index.tsx` (Praktika), `.appearance`, `.pages.home`, `.pages.about`, `.pages.contact`, `.analytics`, `.users`, `.maintenance`.
- Esamų puslapių turinys perkeliamas kaip komponentai (`admin.website.home/about/contact`, `admin.analytics`, `admin.users`) – logika nekeičiama, tik nauja vieta.
- Seni keliai (`/admin/website/home`, `/admin/analytics`, `/admin/users` ir kt.) palieka nukreipimus į naujas vietas, kad išsaugotos nuorodos neveiktų į tuščią.
- Teisės nesikeičia: editor mato viską tik skaitymui, owner redaguoja turinį, defaultines vertes tvirtina tik developer.
- Kainų/atsiliepimų/straipsnių sąrašuose pritaikomas Paslaugų `openId` suskleidimo modelis.
