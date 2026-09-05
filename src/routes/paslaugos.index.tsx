import { createFileRoute } from "@tanstack/react-router";

import { servicesRoute } from "@/pages/paslaugos";

export const Route = createFileRoute("/paslaugos/")(servicesRoute("lt") as never);
