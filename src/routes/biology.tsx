import { createFileRoute } from "@tanstack/react-router";
import { BiologyWorkspace } from "@/components/BiologyWorkspace";

export const Route = createFileRoute("/biology")({
  head: () => ({
    meta: [
      { title: "Կենսաբանություն · Անհատական քննություններ" },
      { name: "description", content: "Կազմիր կենսաբանության թեստ ըստ գրքի, բաժինների, հարցերի տեսակների, քանակի և ժամանակի։" },
    ],
  }),
  component: BiologyWorkspace,
});
