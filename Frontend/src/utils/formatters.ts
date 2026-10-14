export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  // Guard against invalid date strings to prevent runtime errors
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateDaysRemaining = (endDateString?: string): number => {
  if (!endDateString) return 0;
  
  const end = new Date(endDateString).getTime();
  const now = new Date().getTime();
  
  if (isNaN(end)) return 0; // Guard against invalid date strings

  const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
  return diff > 0 ? diff : 0;
};