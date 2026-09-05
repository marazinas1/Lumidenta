import { createFileRoute } from "@tanstack/react-router";

import { straipsniaiLayoutRoute } from "@/pages/straipsniai-layout";

export const Route = createFileRoute("/straipsniai")(straipsniaiLayoutRoute() as never);
