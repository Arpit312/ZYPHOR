import Link from "next/link";
import { ScanLine } from "lucide-react";
import Container from "@/components/shared/Container";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-24">
      <Container className="text-center max-w-md">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-black/5 mb-6">
          <ScanLine className="h-10 w-10 text-black/20" />
        </div>
        <h1 className="font-display font-700 text-4xl text-slate-850">Page not found</h1>
        <p className="mt-2 text-black/55">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-coral hover:bg-coral-dark text-white font-display font-600 px-6 py-3 rounded-lg text-sm transition-colors focus-ring"
        >
          ← Back to home
        </Link>
      </Container>
    </section>
  );
}
