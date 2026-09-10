# „Kainos" atsiranda meniu

Kainoraščio puslapis (`/kainos`) veikia ir turinys jame yra, bet nuoroda į jį niekur nerodoma: viršutinis meniu ir poraštė turi savo atskirus, ranka surašytus sąrašus, kuriuose kainų nėra. Todėl Erika jų ir nemato.

## Ką padarysiu

- Į viršutinį meniu (kompiuteryje ir telefone) įdėsiu „Kainos" tarp „Paslaugos" ir „Registracija".
- Į poraštės nuorodas taip pat įdėsiu „Kainos".
- Poraštės „Paslaugos" nuoroda dabar veda į pradžios puslapio skiltį — pataisysiu, kad vestų į `/paslaugos`, kaip ir viršuje.

Jokių kitų pakeitimų: spalvos, dydžiai ir turinys lieka tokie patys.

## Techninė dalis

- `src/components/site/SiteHeader.tsx` — pridėti `{ label: "Kainos", to: "/kainos" }` į `links` masyvą (naudojamas ir mobiliajame meniu).
- `src/components/site/SiteFooter.tsx` — pridėti `<LocaleLink to="/kainos">Kainos</LocaleLink>` ir pakeisti paslaugų nuorodą į `to="/paslaugos"` be `hash`.
