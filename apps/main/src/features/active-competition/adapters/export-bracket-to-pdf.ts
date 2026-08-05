/**
 * Renders a `BracketExport` (built by `@hajime/core`'s `buildBracketExport`) as a PDF, in the
 * "tournament bracket" style: boxes per fighter, connected round to round by elbow lines, winner
 * highlighted.
 *
 * Only the "main" elimination ladder is drawn (round of N ... final). The third-place match, if
 * any, isn't part of this layout yet — it plays alongside the final rather than feeding it, so
 * it needs its own placement; left out for now rather than bolted on awkwardly.
 *
 * Fighter identities are printed as-is (their raw `FighterId`), matching how the rest of the app
 * currently displays fighters (see `presentFight` in fight-record-to-fight.presenter.ts) — there
 * is no fighter-name lookup yet. Swap `fighterLabel` below once one exists.
 */
import { jsPDF } from "jspdf";
import type { BracketExport, BracketExportMatch } from "@hajime/core";

interface BracketPdfStyle {
  boxWidth: number;
  boxHeight: number;
  slotGap: number;
  colGap: number;
  marginTop: number;
  marginLeft: number;
  accentColor: [number, number, number];
  darkColor: [number, number, number];
  grayColor: [number, number, number];
  textColor: [number, number, number];
  fontSize: number;
  roundLabelFontSize: number;
}

const DEFAULT_STYLE: BracketPdfStyle = {
  boxWidth: 42,
  boxHeight: 8,
  slotGap: 2,
  colGap: 26,
  marginTop: 34,
  marginLeft: 14,
  accentColor: [0, 200, 120],
  darkColor: [20, 20, 20],
  grayColor: [230, 230, 230],
  textColor: [20, 20, 20],
  fontSize: 8,
  roundLabelFontSize: 7,
};

export interface ExportBracketToPdfOptions {
  title?: string;
  style?: Partial<BracketPdfStyle>;
  /** Turns a fighter identity into the text printed in its box. Defaults to the raw id. */
  fighterLabel?: (fighterId: string) => string;
}

interface MatchPosition {
  x: number;
  yTop: number;
  yCenter: number;
}

function fighterLabelDefault(fighterId: string): string {
  return fighterId;
}

function computeLayout(rounds: BracketExportMatch[][], style: BracketPdfStyle): MatchPosition[][] {
  const { boxHeight, slotGap, colGap, marginTop, marginLeft, boxWidth } = style;
  const layout: MatchPosition[][] = [];
  const matchHeight = boxHeight * 2 + slotGap;
  const roundSpacing = matchHeight + 6;

  layout[0] = rounds[0].map((_, i): MatchPosition => {
    const yTop = marginTop + i * roundSpacing;
    return { x: marginLeft, yTop, yCenter: yTop + matchHeight / 2 };
  });

  for (let r = 1; r < rounds.length; r++) {
    const prev = layout[r - 1];
    layout[r] = rounds[r].map((_, i): MatchPosition => {
      const parentA = prev[i * 2];
      const parentB = prev[i * 2 + 1];
      const yCenter = (parentA.yCenter + parentB.yCenter) / 2;
      return {
        x: marginLeft + r * (boxWidth + colGap),
        yTop: yCenter - matchHeight / 2,
        yCenter,
      };
    });
  }

  return layout;
}

function drawMatch(
  doc: jsPDF,
  match: BracketExportMatch,
  pos: MatchPosition,
  style: BracketPdfStyle,
  fighterLabel: (fighterId: string) => string,
): void {
  const { boxWidth, boxHeight, slotGap, accentColor, grayColor, textColor, fontSize } = style;
  const { x, yTop } = pos;

  doc.setFontSize(fontSize);

  ([match.fighter1, match.fighter2] as const).forEach((fighterId, i) => {
    const y = yTop + i * (boxHeight + slotGap);
    const isWinner = fighterId !== null && fighterId === match.winner;

    const fillColor: [number, number, number] = isWinner ? [255, 255, 255] : grayColor;
    const strokeColor: [number, number, number] = isWinner ? accentColor : grayColor;

    doc.setFillColor(...fillColor);
    doc.setDrawColor(...strokeColor);
    doc.setLineWidth(0.4);
    doc.rect(x, y, boxWidth, boxHeight, isWinner ? "FD" : "F");

    if (isWinner) {
      doc.setFillColor(...accentColor);
      doc.rect(x, y, 1.2, boxHeight, "F");
    }

    doc.setTextColor(...textColor);
    doc.text(fighterId ? fighterLabel(fighterId) : "—", x + 3, y + boxHeight / 2 + 1.2);
  });
}

function drawConnectors(
  doc: jsPDF,
  layoutFrom: MatchPosition[],
  layoutTo: MatchPosition[],
  style: BracketPdfStyle,
): void {
  const { boxWidth, boxHeight, slotGap, darkColor } = style;
  doc.setDrawColor(...darkColor);
  doc.setLineWidth(0.5);

  const matchHeight = boxHeight * 2 + slotGap;

  layoutTo.forEach((posTo, i) => {
    const parentA = layoutFrom[i * 2];
    const parentB = layoutFrom[i * 2 + 1];

    const xParentRight = parentA.x + boxWidth;
    const xChildLeft = posTo.x;
    const xElbow = xParentRight + (xChildLeft - xParentRight) / 2;

    const yA = parentA.yTop + matchHeight / 2;
    const yB = parentB.yTop + matchHeight / 2;
    const yChild = posTo.yTop + matchHeight / 2;

    doc.line(xParentRight, yA, xElbow, yA);
    doc.line(xParentRight, yB, xElbow, yB);
    doc.line(xElbow, yA, xElbow, yB);
    doc.line(xElbow, yChild, xChildLeft, yChild);
  });
}

/**
 * Generates and downloads the bracket PDF.
 *
 * Throws if `bracketExport` has no "main" round, or if a main round doesn't have exactly half as
 * many matches as the round before it (the shape `buildBracketExport` always produces for a
 * well-formed bracket) — that would make the elbow-connector layout meaningless.
 */
export function exportBracketToPdf(
  bracketExport: BracketExport,
  filename = "bracket.pdf",
  options: ExportBracketToPdfOptions = {},
): void {
  const mainRounds = bracketExport.rounds
    .filter((round) => round.kind === "main")
    .map((round) => round.matches);

  if (mainRounds.length === 0) {
    throw new Error("exportBracketToPdf: no main round to export.");
  }

  for (let r = 1; r < mainRounds.length; r++) {
    if (mainRounds[r].length * 2 !== mainRounds[r - 1].length) {
      throw new Error(
        `exportBracketToPdf: round ${r} has ${mainRounds[r].length} matches, expected ${mainRounds[r - 1].length / 2}.`,
      );
    }
  }

  const style: BracketPdfStyle = { ...DEFAULT_STYLE, ...options.style };
  const fighterLabel = options.fighterLabel ?? fighterLabelDefault;
  const title = options.title ?? "TOURNAMENT BRACKET";

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const { accentColor, darkColor, boxWidth, boxHeight, slotGap, colGap, roundLabelFontSize } =
    style;

  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.text(title, 14, 15);
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1.5);
  doc.line(14, 19, 60, 19);

  const layout = computeLayout(mainRounds, style);
  const roundLabels = bracketExport.rounds.filter((round) => round.kind === "main");

  doc.setFontSize(roundLabelFontSize);
  doc.setTextColor(...darkColor);
  layout.forEach((positions, r) => {
    if (positions.length === 0) return;
    doc.text(roundLabels[r].label.toUpperCase(), positions[0].x, positions[0].yTop - 3);
  });

  mainRounds.forEach((matches, r) => {
    matches.forEach((match, i) => {
      drawMatch(doc, match, layout[r][i], style, fighterLabel);
    });
  });

  for (let r = 1; r < mainRounds.length; r++) {
    drawConnectors(doc, layout[r - 1], layout[r], style);
  }

  const finalMatches = mainRounds[mainRounds.length - 1];
  const finalLayout = layout[layout.length - 1][0];
  const champion = finalMatches[0]?.winner ?? null;

  if (champion) {
    const matchHeight = boxHeight * 2 + slotGap;
    const xChamp = finalLayout.x + boxWidth + colGap;
    const yChamp = finalLayout.yTop + matchHeight / 2 - boxHeight / 2;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...accentColor);
    doc.rect(xChamp, yChamp, boxWidth, boxHeight, "FD");
    doc.setFillColor(...accentColor);
    doc.rect(xChamp, yChamp, 1.2, boxHeight, "F");
    doc.setFontSize(style.fontSize);
    doc.setTextColor(...darkColor);
    doc.text(fighterLabel(champion), xChamp + 3, yChamp + boxHeight / 2 + 1.2);
  }

  doc.save(filename);
}
