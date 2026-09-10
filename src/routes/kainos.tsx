import { createFileRoute } from "@tanstack/react-router";

import { pricesRoute } from "@/pages/kainos";

export const Route = createFileRoute("/kainos")(pricesRoute("lt") as never);
