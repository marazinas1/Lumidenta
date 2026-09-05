import { createFileRoute } from "@tanstack/react-router";

import { postDetailRoute } from "@/pages/straipsniai";

export const Route = createFileRoute("/en/straipsniai/$slug")(postDetailRoute("en") as never);
