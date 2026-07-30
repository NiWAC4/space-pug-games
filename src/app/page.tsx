import { SpacePugSite } from "@/components/space-pug-site";

export default function Home() {
  const variant = process.env.NEXT_PUBLIC_DESIGN_VARIANT === "secondary" ? "secondary" : "primary";
  return <SpacePugSite variant={variant} />;
}
