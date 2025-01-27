
export function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5)
}

export function findMaxBy<T>(array: T[], fn: (item: T) => number): T {
  return array.reduce((max, item) => (fn(item) > fn(max) ? item : max), array[0])
}
