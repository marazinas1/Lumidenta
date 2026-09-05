import { createFileRoute } from "@tanstack/react-router";

import { paslaugosLayoutRoute } from "@/pages/paslaugos-layout";

export const Route = createFileRoute("/paslaugos")(paslaugosLayoutRoute() as never);
