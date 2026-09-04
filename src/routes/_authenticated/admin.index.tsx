import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Valdymo skydelis</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Skydelis kol kas tuščias. Paslaugos, darbo laikas ir vizitų užklausos bus pridėtos
        kituose etapuose.
      </p>
    </div>
  );
}
