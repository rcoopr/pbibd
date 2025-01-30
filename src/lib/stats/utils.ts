class StatsImpl {
  static sum(arr: number[]) {
    return arr.reduce((a, b) => a + b, 0)
  }

  static mean(arr: number[]) {
    return StatsImpl.sum(arr) / arr.length
  }

  static variance(arr: number[]) {
    const m = StatsImpl.mean(arr)
    return StatsImpl.sum(arr.map(x => (x - m) ** 2)) / arr.length
  }
}

export const Stats = new StatsImpl()

export function distributeSum(length: number, sum: number) {
  return Array.from({ length }).map((_, i) => Math.floor(sum / length) + (i < sum % length ? 1 : 0))
}
