export function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}
