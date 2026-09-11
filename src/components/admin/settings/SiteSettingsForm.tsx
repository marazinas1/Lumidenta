import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CATALOG_KEY, catalogQuery } from "@/lib/catalog";
import { saveSiteSettings } from "@/lib/catalog-admin.functions";
import { uploadFaviconToStorage, uploadLogoToStorage } from "@/lib/image-optimize";

type Form = {
  practice_name: string;
  dentist_name: string;
  phone: string;
  email: string;
  address_line: string;
  district: string;
  opl_licence: string;
  aspi_licence: string;
  facebook_url: string;
  map_url: string;
  favicon_path: string;
  logo_path: string;
  logo_size: number;
  maintenance_mode: boolean;
  maintenance_message: string;
};

const FIELDS: { key: keyof Form; label: string; hint?: string }[] = [
  { key: "practice_name", label: "Praktikos pavadinimas" },
  { key: "dentist_name", label: "Gydytojos vardas" },
  { key: "phone", label: "Telefonas" },
  { key: "email", label: "El. paštas" },
  { key: "address_line", label: "Adresas" },
  { key: "district", label: "Mikrorajonas / miestas" },
  { key: "opl_licence", label: "Odontologo praktikos licencijos nr.", hint: "Įrašyti tik patvirtintą numerį." },
  { key: "aspi_licence", label: "ASPĮ licencijos nr.", hint: "Įrašyti tik patvirtintą numerį." },
  { key: "facebook_url", label: "Facebook nuoroda" },
  { key: "map_url", label: "Žemėlapio nuoroda" },
];

const LOGO_OPTIONS: { path: string; label: string }[] = [
  { path: "logo/option-1.png", label: "1 – žvaigždutė" },
  { path: "logo/option-2.png", label: "2 – danties siluetas" },
  { path: "logo/option-3.png", label: "3 – tipografinis" },
  { path: "logo/option-4.png", label: "4 – „L“ ženklas" },
];

const publicUrl = (path: string) =>
  `${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/public/site-images/${path}`;

const EMPTY: Form = {
  practice_name: "",
  dentist_name: "",
  phone: "",
  email: "",
  address_line: "",
  district: "",
  opl_licence: "",
  aspi_licence: "",
  facebook_url: "",
  map_url: "",
  favicon_path: "",
  logo_path: "",
  logo_size: 48,
  maintenance_mode: false,
  maintenance_message: "",
};

export type SettingsSection = "practice" | "appearance" | "maintenance";

export function SiteSettingsForm({ section }: { section: SettingsSection }) {
  const { canEdit } = useCanEdit();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(catalogQuery);
  const save = useServerFn(saveSiteSettings);
  const [form, setForm] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!data) return;
    const s = data.settings;
    setForm({
      practice_name: s.practiceName,
      dentist_name: s.dentistName,
      phone: s.phone,
      email: s.email,
      address_line: s.addressLine,
      district: s.district,
      opl_licence: s.oplLicence,
      aspi_licence: s.aspiLicence,
      facebook_url: s.facebookUrl,
      map_url: s.mapUrl,
      favicon_path: s.faviconPath,
      logo_path: s.logoPath,
      logo_size: s.logoSize,
      maintenance_mode: s.maintenanceMode,
      maintenance_message: s.maintenanceMessage,
    });
  }, [data]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const faviconUrl = form.favicon_path
    ? (data?.settings.faviconUrl ?? null) && form.favicon_path === data?.settings.faviconPath
      ? data.settings.faviconUrl
      : null
    : null;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const logoUrl =
    form.logo_path && form.logo_path === data?.settings.logoPath
      ? (data?.settings.logoUrl ?? null)
      : null;

  async function onLogoFile(file: File) {
    setLogoUploading(true);
    try {
      const uploaded = await uploadLogoToStorage(file);
      await save({ data: { ...form, logo_path: uploaded.path } });
      setForm((f) => ({ ...f, logo_path: uploaded.path }));
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Logotipas įkeltas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko įkelti logotipo");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function chooseLogo(path: string) {
    setLogoUploading(true);
    try {
      await save({ data: { ...form, logo_path: path } });
      setForm((f) => ({ ...f, logo_path: path }));
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Logotipas pakeistas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko pakeisti logotipo");
    } finally {
      setLogoUploading(false);
    }
  }

  async function resetLogo() {
    setLogoUploading(true);
    try {
      await save({ data: { ...form, logo_path: "" } });
      setForm((f) => ({ ...f, logo_path: "" }));
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Grąžintas numatytasis logotipas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko atstatyti");
    } finally {
      setLogoUploading(false);
    }
  }

  async function onFaviconFile(file: File) {
    setUploading(true);
    try {
      const uploaded = await uploadFaviconToStorage(file);
      await save({ data: { ...form, favicon_path: uploaded.path } });
      setForm((f) => ({ ...f, favicon_path: uploaded.path }));
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Ikona įkelta. Naršyklė ją atnaujins po kelių minučių.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko įkelti ikonos");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function resetFavicon() {
    setUploading(true);
    try {
      await save({ data: { ...form, favicon_path: "" } });
      setForm((f) => ({ ...f, favicon_path: "" }));
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
      toast.success("Atstatyta numatytoji „L“ ikona.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko atstatyti");
    } finally {
      setUploading(false);
    }
  }

  const mutation = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: async () => {
      toast.success("Išsaugota.");
      await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />

      {section === "practice" ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Praktikos duomenys</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Šie duomenys rodomi kontaktų puslapyje, poraštėje ir žemėlapyje. Tušti laukai
              nerodomi.
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Kraunama…</p>
          ) : (
            <section className="space-y-5 rounded-xl border border-border/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                    {field.hint ? (
                      <p className="text-xs text-muted-foreground">{field.hint}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? "Saugoma…" : "Išsaugoti"}
              </Button>
            </section>
          )}
        </>
      ) : null}

      {section === "appearance" ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Išvaizda</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Logotipas ir svetainės ikona. Pakeitimai matomi visoje svetainėje iš karto.
            </p>
          </div>

          {isLoading ? null : (
            <section className="space-y-4 rounded-xl border border-border/70 p-5">
              <div>
                <Label>Logotipas</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rodomas svetainės viršuje, poraštėje, prisijungimo lange ir admin panelėje.
                  Geriausiai tinka PNG su permatomu fonu arba SVG.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 min-w-[240px] items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted px-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logotipas"
                      className="w-auto max-w-[260px] object-contain"
                      style={{ height: form.logo_size }}
                    />
                  ) : (
                    <span className="text-sm font-extrabold">Lumidenta</span>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onLogoFile(file);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={logoUploading}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoUploading ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-3.5 w-3.5" />
                  )}
                  Įkelti logotipą
                </Button>
                {form.logo_path ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={logoUploading}
                    onClick={() => void resetLogo()}
                  >
                    Grąžinti numatytąjį
                  </Button>
                ) : null}
              </div>

              <div className="max-w-md space-y-3 rounded-lg border border-border/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="logo-size">Logotipo dydis</Label>
                  <span className="text-sm font-semibold tabular-nums">{form.logo_size} px</span>
                </div>
                <Slider
                  id="logo-size"
                  min={32}
                  max={80}
                  step={2}
                  value={[form.logo_size]}
                  onValueChange={([value]) => {
                    if (value !== undefined) setForm((current) => ({ ...current, logo_size: value }));
                  }}
                  onValueCommit={([value]) => {
                    if (value === undefined) return;
                    const next = { ...form, logo_size: value };
                    setForm(next);
                    void save({ data: next })
                      .then(async () => {
                        await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
                        toast.success("Logotipo dydis išsaugotas.");
                      })
                      .catch((error: unknown) => {
                        toast.error(
                          error instanceof Error ? error.message : "Nepavyko išsaugoti dydžio",
                        );
                      });
                  }}
                  aria-label="Logotipo dydis"
                />
                <p className="text-xs text-muted-foreground">
                  Dydis bus vienodas svetainės viršuje, poraštėje, prisijungime ir administravime.
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Paruošti variantai — paspauskite, kad pasirinktumėte:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LOGO_OPTIONS.map((option) => {
                    const active = form.logo_path === option.path;
                    return (
                      <button
                        key={option.path}
                        type="button"
                        disabled={logoUploading}
                        onClick={() => void chooseLogo(option.path)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs transition ${
                          active
                            ? "border-primary bg-primary/5 font-semibold"
                            : "border-border/70 hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={publicUrl(option.path)}
                          alt={option.label}
                          loading="lazy"
                          className="h-12 w-auto max-w-full object-contain"
                        />
                        <span>
                          {option.label}
                          {active ? " · naudojamas" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {isLoading ? null : (
            <section className="space-y-4 rounded-xl border border-border/70 p-5">
              <div>
                <Label>Svetainės ikona (favicon)</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maža ikona naršyklės kortelėje ir telefono ekrane. Geriausiai tinka kvadratinis
                  PNG paveikslėlis. Kol nieko neįkelta, rodoma numatytoji „L“ ikona.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted">
                  <img
                    src={faviconUrl ?? "/api/public/favicon"}
                    alt="Svetainės ikona"
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onFaviconFile(file);
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-3.5 w-3.5" />
                  )}
                  Įkelti ikoną
                </Button>
                {form.favicon_path ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={uploading}
                    onClick={() => void resetFavicon()}
                  >
                    Atstatyti „L“ ikoną
                  </Button>
                ) : null}
              </div>
            </section>
          )}
        </>
      ) : null}

      {section === "maintenance" ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Techninių darbų režimas</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Laikinai paslėpkite svetainę nuo lankytojų, kol tvarkote turinį.
            </p>
          </div>

          {isLoading ? null : (
            <section className="space-y-4 rounded-xl border border-border/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Label>Techninių darbų režimas</Label>
                  <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                    Įjungus, lankytojai mato tik pranešimą apie laikiną atnaujinimą su Jūsų telefonu
                    ir el. paštu. Prisijungę prie administravimo matote įprastą svetainę, todėl
                    galite ramiai tvarkyti turinį. Išjungus — svetainė grįžta iš karto.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {form.maintenance_mode ? "Įjungta" : "Išjungta"}
                  </span>
                  <Switch
                    checked={form.maintenance_mode}
                    onCheckedChange={(checked) => {
                      const next = { ...form, maintenance_mode: checked };
                      setForm(next);
                      void save({ data: next })
                        .then(async () => {
                          await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
                          toast.success(
                            checked
                              ? "Techninių darbų režimas įjungtas."
                              : "Svetainė vėl matoma lankytojams.",
                          );
                        })
                        .catch((error: unknown) => {
                          setForm((f) => ({ ...f, maintenance_mode: !checked }));
                          toast.error(
                            error instanceof Error ? error.message : "Nepavyko pakeisti režimo",
                          );
                        });
                    }}
                    aria-label="Techninių darbų režimas"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Pranešimas lankytojams</Label>
                <Textarea
                  id="maintenance-message"
                  rows={3}
                  placeholder="Svetainė šiuo metu atnaujinama. Netrukus grįšime — kol kas susisiekite telefonu arba el. paštu."
                  value={form.maintenance_message}
                  onChange={(e) => setForm({ ...form, maintenance_message: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  Išsaugoti pranešimą
                </Button>
              </div>
            </section>
          )}
        </>
      ) : null}
    </fieldset>
  );
}
