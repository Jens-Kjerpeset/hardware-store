export function formatCurrency(amount: number): string {
  // Format as Norwegian Krone (e.g., "1 499,00 Kr")
  return (
    new Intl.NumberFormat("no-NO", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " Kr"
  );
}
