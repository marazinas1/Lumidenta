/**
 * Bendri lietuviški tekstai. Tik paprasti įdėti tekstai — visą aplanką galima
 * serializuoti į `lt.json` ir veidrodiniu būdu pakartoti kitomis kalbomis.
 */
export const common = {
  brand: "Lumidenta",
  tagline: "",
  cta: {
    more: "Plačiau",
    openMap: "Atidaryti žemėlapyje",
    contactUs: "Susisiekti",
  },
  nav: {
    home: "Pagrindinis",
    services: "Paslaugos",
    about: "Apie",
    contacts: "Kontaktai",
    site: "Svetainė",
  },
  labels: {
    contacts: "Kontaktai",
    address: "Adresas",
    breadcrumb: "Naršymo kelias",
  },
  footer: {
    intro: "",
    rights: "Visos teisės saugomos.",
  },
} as const;
