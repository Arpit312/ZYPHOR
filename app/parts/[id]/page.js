import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

export default async function PartDetailPage({ params }) {
  const { id } = await params;
  redirect(`/marketplace/${id}`);
}
