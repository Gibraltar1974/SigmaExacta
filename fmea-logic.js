// AIAG-VDA 2019 Action Priority – exact match after final validation
function getActionPriority(s, o, d) {
  if (s < 1 || s > 10 || o < 1 || o > 10 || d < 1 || d > 10)
    throw new Error('S, O, D must be between 1 and 10');

  if (s === 1 || o === 1) return 'L';

  // S 9–10
  if (s >= 9) {
    if (o >= 6) return 'H';
    if (o >= 4) return d === 1 ? 'M' : 'H';
    if (d >= 7) return 'H';
    if (d >= 5) return 'M';
    return 'L';
  }
  // S 7–8
  if (s >= 7) {
    if (o >= 8) return 'H';
    if (o >= 6) return d === 1 ? 'M' : 'H';
    if (o >= 4) return d >= 7 ? 'H' : 'M';   // fix 1: sin special-case o===5&&d===7
    if (d >= 5) return 'M';
    return 'L';
  }
  // S 4–6
  if (s >= 4) {
    if (o >= 8) return d >= 7 ? 'H' : 'M';
    if (o >= 6) return d >= 2 ? 'M' : 'L';
    if (o >= 4) return d >= 7 ? 'M' : 'L';   // fix 2: sin special-case s===4&&o===4&&d>=8
    return 'L';
  }
  // S 2–3
  if (s >= 2) {
    if (o >= 8) return d >= 5 ? 'M' : 'L';
    return 'L';
  }
  return 'L';
}