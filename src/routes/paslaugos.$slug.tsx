import { createFileRoute } from "@tanstack/react-router";

import { serviceDetailRoute } from "@/pages/paslaugos";

export const Route = createFileRoute("/paslaugos/$slug")(serviceDetailRoute("lt") as never);
