import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, Fragment, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Question } from "@/lib/types";

// Animasi dimatikan: elemen motion dirender sebagai elemen HTML biasa.
vi.mock("motion/react", () => {
  const strip = ({ initial, animate, exit, transition, ...rest }: Record<string, unknown>) => (void [initial, animate, exit, transition], rest);
  const motion = new Proxy({}, { get: (_, tag: string) => (props: Record<string, unknown>) => createElement(tag, strip(props)) });
  const Pass = ({ children }: { children: ReactNode }) => createElement(Fragment, null, children);
  return { motion, AnimatePresence: Pass, MotionConfig: Pass };
});
vi.mock("@/lib/sound", () => ({ playCorrect: vi.fn(), playWrong: vi.fn(), playCelebrate: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

const QUESTIONS: Question[] = [
  { id: "t1", type: "pilihan", topic: "A", prompt: "Soal pilihan", hint: "Petunjuk satu", options: ["satu", "dua", "tiga"], answer: 1 },
  { id: "t2", type: "isian", topic: "B", prompt: "Soal isian", hint: "h", answer: 7 },
  { id: "t3", type: "cocokkan", topic: "C", prompt: "Soal cocokkan", hint: "h", pairs: [["kiri1", "KANAN1"], ["kiri2", "KANAN2"]] },
  { id: "t4", type: "urutkan", topic: "D", prompt: "Soal urutkan", hint: "h", items: ["x1", "x2", "x3"] },
  { id: "t5", type: "pilihan", topic: "E", prompt: "Soal terakhir", hint: "h", options: ["p", "q", "r", "s"], answer: 3 },
];
vi.mock("@/data/questions", () => ({
  getQuestions: () => QUESTIONS,
  SUBJECTS: [{ id: "matematika", name: "Matematika", emoji: "🔢" }],
}));
vi.mock("@/lib/session", async (orig) => ({
  ...(await orig<typeof import("@/lib/session")>()),
  pickQuestions: (bank: Question[]) => bank,
}));

const { AppProvider } = await import("@/components/AppProvider");
const { QuizSession } = await import("./QuizSession");
const { useApp } = await import("@/components/AppProvider");

function Gate() {
  const { ready, student } = useApp();
  return ready && student ? <QuizSession subject="matematika" /> : null;
}

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("QuizSession", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "tumbuh:v1",
      JSON.stringify({
        version: 1,
        student: { nickname: "Uji", avatar: "🐰", grade: 3, createdAt: "2026-10-06" },
        garden: { activePlantId: "rafflesia", water: 0, fertilizer: 0, collection: [], streak: 0, lastStudyDate: null },
        sessions: [],
        challenges: [],
        encouragements: [],
      }),
    );
  });

  it("menjalankan satu sesi penuh dengan 4 tipe soal sampai layar hasil", async () => {
    render(
      <AppProvider>
        <Gate />
      </AppProvider>,
    );
    await screen.findByText("Soal pilihan");

    // Pilihan: salah dulu (petunjuk muncul), lalu benar.
    click("satu");
    expect(screen.getByRole("status")).toHaveTextContent("Petunjuk satu");
    click("dua");
    click("Soal berikutnya");

    // Isian angka.
    click("7");
    click("Cek jawaban");
    click("Soal berikutnya");

    // Cocokkan: klik kiri lalu kanan.
    click(/kiri1/);
    click("KANAN1");
    click(/kiri2/);
    click("KANAN2");
    click("Cek jawaban");
    click("Soal berikutnya");

    // Urutkan.
    ["x1", "x2", "x3"].forEach((x) => click(x));
    click("Cek jawaban");
    click("Soal berikutnya");

    // Salah 3 kali: jawaban ditunjukkan.
    ["p", "q", "r"].forEach((x) => click(x));
    expect(screen.getByRole("status")).toHaveTextContent("Jawabannya s");
    await act(async () => click("Lihat hasil"));

    // Hasil: 4 air (4 soal terjawab), 3 pupuk (3 benar di percobaan pertama).
    await screen.findByText("Sesi selesai");
    expect(document.body).toHaveTextContent("💧 +4Air");
    expect(document.body).toHaveTextContent("🌱 +3Pupuk");
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("tumbuh:v1")!);
      expect(saved.sessions).toHaveLength(1);
      expect(saved.garden.water + saved.garden.fertilizer).toBe(7);
    });
  });
});
