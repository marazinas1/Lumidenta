import { createFileRoute } from "@tanstack/react-router";

import { paslaugosLayoutRoute } from "@/pages/paslaugos-layout";

export const Route = createFileRoute("/en/paslaugos")(paslaugosLayoutRoute() as never);
