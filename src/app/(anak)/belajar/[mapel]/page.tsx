import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUBJECTS } from "@/data/questions";
import { QuizSession } from "@/features/child/QuizSession";

export const dynamicParams = false;
export const generateStaticParams = () => SUBJECTS.map((s) => ({ mapel: s.id }));

export async function generateMetadata({ params }: PageProps<"/belajar/[mapel]">): Promise<Metadata> {
  const { mapel } = await params;
  return { title: `Belajar ${SUBJECTS.find((s) => s.id === mapel)?.name ?? ""}` };
}

export default async function Page({ params }: PageProps<"/belajar/[mapel]">) {
  const { mapel } = await params;
  const subject = SUBJECTS.find((s) => s.id === mapel);
  if (!subject) notFound();
  return <QuizSession subject={subject.id} />;
}
