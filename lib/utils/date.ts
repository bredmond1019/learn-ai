// Format date for display
export function formatDate(date: string): string {
  // Handle date-only strings by adding UTC time, otherwise use as-is
  const dateString = date.includes('T') ? date : date + 'T00:00:00.000Z'
  const dateObj = new Date(dateString)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Force UTC timezone for consistent results
  })
}