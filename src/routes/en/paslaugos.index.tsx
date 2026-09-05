import { createFileRoute } from "@tanstack/react-router";

import { servicesRoute } from "@/pages/paslaugos";

export const Route = createFileRoute("/en/paslaugos/")(servicesRoute("en") as never);
