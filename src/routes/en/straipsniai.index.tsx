import { createFileRoute } from "@tanstack/react-router";

import { postsRoute } from "@/pages/straipsniai";

export const Route = createFileRoute("/en/straipsniai/")(postsRoute("en") as never);
