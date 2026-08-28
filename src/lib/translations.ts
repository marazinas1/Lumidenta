export type TranslatableEntity = "content_template";

export type TranslatableFieldDef = {
  /** Rakto reikšmė DB stulpelyje `field`. */
  field: string;
  /** Vertimo raktas etiketei; jei nėra — naudojamas `label`. */
  labelKey?: string;
  label: string;
  multiline?: boolean;
  /** Laukas saugo HTML — rodyti/redaguoti su teksto redaktoriumi. */
  html?: boolean;
};

/**
 * Papildomos paslaugos saugomos jsonb masyve ir kainų skaičiavime atpažįstamos
 * PAGAL PAVADINIMĄ, tad lietuviškas pavadinimas faktiškai yra jų identifikatorius.
 */
export const EXTRA_SERVICE_FIELD_PREFIX = "extra_service.";

export function extraServiceField(ltName: string): string {
  return `${EXTRA_SERVICE_FIELD_PREFIX}${ltName.trim()}`;
}

/** Ar šis laukas apskritai gali būti verčiamas? */
export function isAllowedField(entityType: TranslatableEntity, field: string): boolean {
  if (entityType === "content_template") {
    return field === "subject" || field === "content";
  }
  return true; // kiti tipai bus pridėti vėlesniuose etapuose
}

/** Vertimų rinkinys: { [field]: { [lang]: value } } */
export type TranslationMap = Record<string, Record<string, string>>;
