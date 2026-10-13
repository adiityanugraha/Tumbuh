import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUBJECTS } from "@/data/questions";
import { QuizSession } from "@/features/child/QuizSession";

export const dynamicParams = false;
export const generateStaticParams = () =>
  SUBJECTS.map((s) => ({ mapel: s.id }));

export async function generateMetadata({
  params,
}: PageProps<"/belajar/[mapel]/ulang">): Promise<Metadata> {
  const { mapel } = await params;
  const name = SUBJECTS.find((s) => s.id === mapel)?.name ?? "";
  return {
    title: `Siram Ulang ${name}`,
    description: `Ulangi soal ${name} yang pernah salah sampai benar.`,
  };
}

export default async function Page({
  params,
}: PageProps<"/belajar/[mapel]/ulang">) {
  const { mapel } = await params;
  const subject = SUBJECTS.find((s) => s.id === mapel);
  if (!subject) notFound();
  return <QuizSession subject={subject.id} review />;
}
