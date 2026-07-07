export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Number must be a positive integer");
  }

  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}
