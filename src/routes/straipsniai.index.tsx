import { createFileRoute } from "@tanstack/react-router";

import { postsRoute } from "@/pages/straipsniai";

export const Route = createFileRoute("/straipsniai/")(postsRoute("lt") as never);
