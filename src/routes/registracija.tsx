import { createFileRoute } from "@tanstack/react-router";

import { bookingRoute } from "@/pages/registracija";

export const Route = createFileRoute("/registracija")(bookingRoute("lt") as never);
