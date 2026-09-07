import Observatory from "@/components/observatory";

export const dynamic = "force-dynamic";

export default function Explore() {
  return <Observatory initialTime={new Date().toISOString()} />;
}
