export function AdminPlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        {note ?? "Šis skyrius kol kas tuščias — turinys bus pridėtas kitame etape."}
      </p>
    </div>
  );
}
