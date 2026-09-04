# Pirmas administratorius: rutkusmarius@gmail.com

## Kas yra dabar

Patikrinta duomenų bazė: vartotojų sąraše **nėra nė vieno vartotojo** ir nėra priskirtų rolių. Todėl prisijungti prie admin ir nepavyksta — paskyros paprasčiausiai dar nėra. Trinti nieko nereikia.

Taip pat patikrinta: šiam projektui dar nesukonfigūruotas savas el. laiškų siuntimo domenas, tad kvietimo laiškas per svetainės vidinę siuntimo sistemą neišeitų. Slaptažodžio susikūrimo laišką atsiųs standartinė prisijungimo sistema — ji veikia ir be domeno.

## Ką padarysiu

1. Sukursiu paskyrą **rutkusmarius@gmail.com** ir iš karto patvirtinsiu el. paštą (kad nereikėtų atskiro patvirtinimo žingsnio).
2. Priskirsiu jai administratoriaus rolę — būsite pirmas ir vienintelis admin.
3. Iš prisijungimo puslapio inicijuosiu slaptažodžio susikūrimo laišką į Jūsų el. paštą. Laiške bus nuoroda į puslapį, kuriame pasirinksite savo slaptažodį.
4. Patikrinsiu, kad po slaptažodžio nustatymo prisijungimas veda tiesiai į admin panelę.

Po to prisijungsite adresu `/admin` (arba per „Admin“ nuorodą svetainės apačioje).

## Jei laiškas neateitų

Atsarginis variantas: sugeneruosiu Jums vienkartinę slaptažodžio nustatymo nuorodą ir pateiksiu ją tiesiai pokalbyje — tada el. paštas visai nereikalingas.

## Techninės detalės

- Vartotojas kuriamas per Supabase Auth Admin API (`createUser`, `email_confirm: true`).
- Rolė įrašoma į `public.user_roles` (`role = 'admin'`), kurią skaito `has_role()` ir `getMyRole` server funkcija.
- Slaptažodžio laiškas siunčiamas standartiniu `supabase.auth.resetPasswordForEmail` srautu su `redirectTo` į esamą `/reset-password` maršrutą.
- Atsarginis variantas — `auth.admin.generateLink({ type: 'recovery' })`, nuoroda pateikiama pokalbyje.
- Jokių schemos migracijų nereikia; kodo keitimų taip pat nenumatoma.
