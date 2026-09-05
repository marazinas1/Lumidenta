import { createFileRoute } from "@tanstack/react-router";

import { serviceDetailRoute } from "@/pages/paslaugos";

export const Route = createFileRoute("/en/paslaugos/$slug")(serviceDetailRoute("en") as never);
