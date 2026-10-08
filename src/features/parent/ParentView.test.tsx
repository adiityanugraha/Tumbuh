import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => {
  const strip = ({ initial, animate, exit, transition, ...rest }: Record<string, unknown>) => (void [initial, animate, exit, transition], rest);
  // Satu komponen per tag (di-cache), agar React tidak me-mount ulang subtree di setiap render.
  const cache: Record<string, unknown> = {};
  const motion = new Proxy({}, { get: (_, tag: string) => (cache[tag] ??= (props: Record<string, unknown>) => createElement(tag, strip(props))) });
  const Pass = ({ children }: { children: ReactNode }) => createElement(Fragment, null, children);
  return { motion, AnimatePresence: Pass, MotionConfig: Pass };
});

const { AppProvider } = await import("@/components/AppProvider");
const { ParentView } = await import("./ParentView");
const { createDemoData } = await import("@/data/demo");

/** Jawab soal gerbang dari label input, misalnya "Hasil 23 kali 7". */
function answerGate(correct: boolean) {
  const input = screen.getByLabelText(/^Hasil/);
  const [a, b] = input.getAttribute("aria-label")!.match(/\d+/g)!.map(Number);
  fireEvent.change(input, { target: { value: String(a * b + (correct ? 0 : 1)) } });
  fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
}

describe("ParentView", () => {
  beforeEach(() => {
    const { student, garden, sessions } = createDemoData(new Date().toLocaleDateString("sv-SE"));
    localStorage.setItem("tumbuh:v1", JSON.stringify({ version: 1, student, garden, sessions, encouragements: [] }));
  });

  it("gerbang orang tua, laporan, lalu kirim semangat", async () => {
    render(
      <AppProvider>
        <ParentView />
      </AppProvider>,
    );
    await screen.findByText("Khusus orang tua");

    answerGate(false);
    expect(screen.getByRole("status")).toHaveTextContent("Belum tepat");
    answerGate(true);

    await screen.findByText("Laporan Belajar Dewi");
    expect(screen.getByText(/Dewi belajar 5 hari minggu ini dan menjawab 40 soal/)).toBeInTheDocument();
    expect(screen.getAllByText("Perlu latihan").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Ayah" }));
    fireEvent.click(screen.getByRole("button", { name: "Hebat, kebunmu makin subur!" }));
    fireEvent.click(screen.getByRole("button", { name: "Kirim Semangat" }));

    await screen.findByText(/Terkirim!/);
    expect(screen.getByText(/Ayah ·/)).toHaveTextContent("Belum dibaca");
    const saved = JSON.parse(localStorage.getItem("tumbuh:v1")!).encouragements;
    expect(saved).toMatchObject([{ from: "Ayah", message: "Hebat, kebunmu makin subur!", sticker: "🌟", read: false }]);
  });
});
