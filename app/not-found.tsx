import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <div className="text-6xl font-black text-[#f5c542]">404</div>
        <div className="text-lg text-white/60">Page not found</div>
        <Link href="/" className="text-[#f5c542] underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
