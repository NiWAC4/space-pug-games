import { SpacePugSite } from "@/components/space-pug-site";

export default function Home() {
  // The cinematic design is now the public default. Set NEXT_PUBLIC_DESIGN_VARIANT=primary for the pug-design preview.
  const variant = process.env.NEXT_PUBLIC_DESIGN_VARIANT === "primary" ? "primary" : "secondary";
  return <SpacePugSite variant={variant} />;
}
