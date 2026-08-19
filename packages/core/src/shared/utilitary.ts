export function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // copie pour ne pas muter l'original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]; // échange
  }
  return result;
}
