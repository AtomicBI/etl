export function unixTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000)
}
