import { createFileRoute } from "@tanstack/react-router";

import { postDetailRoute } from "@/pages/straipsniai";

export const Route = createFileRoute("/straipsniai/$slug")(postDetailRoute("lt") as never);
