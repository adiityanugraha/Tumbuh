import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUBJECTS } from "@/data/questions";
import { TopikView } from "@/features/child/TopikView";

export const dynamicParams = false;
export const generateStaticParams = () => SUBJECTS.map((s) => ({ mapel: s.id }));

export async function generateMetadata({ params }: PageProps<"/belajar/[mapel]/topik">): Promise<Metadata> {
  const { mapel } = await params;
  const name = SUBJECTS.find((s) => s.id === mapel)?.name ?? "";
  return { title: `Topik ${name}`, description: `Pilih topik ${name} yang ingin dilatih, lengkap dengan tingkat penguasaannya.` };
}

export default async function Page({ params }: PageProps<"/belajar/[mapel]/topik">) {
  const { mapel } = await params;
  const subject = SUBJECTS.find((s) => s.id === mapel);
  if (!subject) notFound();
  return <TopikView subject={subject.id} />;
}
