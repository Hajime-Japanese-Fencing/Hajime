/**
 * Renders a `PoolExport` (built by `@hajime/core`'s `buildPoolExport`) as a PDF: one table per
 * pool, listing its fights and their result so far.
 *
 * No standings/ranking table yet (points, victories, ippon difference) — `buildPoolExport`
 * doesn't compute that either, see its doc comment. Once that computation lands in
 * `@hajime/core`, this export should grow a ranking table under each pool's fight table.
 *
 * Requires `jspdf-autotable` (`npm install jspdf-autotable`) in addition to `jspdf`.
 *
 * Fighter identities are printed as-is (their raw `FighterId`), same convention as the bracket
 * export — swap `fighterLabel` once a name lookup exists.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PoolExport, PoolExportFight } from "@hajime/core";

export interface ExportPoolToPdfOptions {
  title?: string;
  fighterLabel?: (fighterId: string) => string;
}

const PAGE_MARGIN = 14;
const PAGE_BOTTOM_LIMIT = 270; // mm, A4 portrait minus a bottom margin
const ACCENT_COLOR: [number, number, number] = [0, 200, 120];

function fighterLabelDefault(fighterId: string): string {
  return fighterId;
}

function resultLabel(fight: PoolExportFight, fighterLabel: (fighterId: string) => string): string {
  if (fight.status !== "finished") return "—";
  if (!fight.winner) return "No decision";
  return fighterLabel(fight.winner);
}

function tableFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

export function exportPoolToPdf(
  poolExport: PoolExport,
  filename = "pools.pdf",
  options: ExportPoolToPdfOptions = {},
): void {
  const fighterLabel = options.fighterLabel ?? fighterLabelDefault;
  const title = options.title ?? "POOL FIGHTS";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text(title, PAGE_MARGIN, 15);
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(1.5);
  doc.line(PAGE_MARGIN, 19, PAGE_MARGIN + 46, 19);

  let cursorY = 28;

  poolExport.pools.forEach((pool) => {
    if (cursorY > PAGE_BOTTOM_LIMIT - 20) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`Pool ${pool.poolId}`, PAGE_MARGIN, cursorY);
    cursorY += 4;

    autoTable(doc, {
      startY: cursorY,
      head: [["Fighter 1", "Fighter 2", "Result"]],
      body: pool.fights.map((fight) => [
        fighterLabel(fight.fighter1),
        fighterLabel(fight.fighter2),
        resultLabel(fight, fighterLabel),
      ]),
      theme: "grid",
      headStyles: { fillColor: ACCENT_COLOR, textColor: [20, 20, 20] },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    });

    cursorY = tableFinalY(doc) + 10;
  });

  doc.save(filename);
}
