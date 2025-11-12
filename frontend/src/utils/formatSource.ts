/**
 * Format job source name for display
 * Converts technical source names to user-friendly display names
 */
export function formatSource(source: string): string {
  if (!source) return 'Ukjent kilde';
  
  const sourceLower = source.toLowerCase().trim();
  
  // Map technical source names to display names
  const sourceMap: Record<string, string> = {
    'finn.no': 'Finn.no',
    'finn': 'Finn.no',
    'manpower': 'Manpower',
    'adecco': 'Adecco',
    'arbeidsplassen': 'Arbeidsplassen',
    'arbeidsplassen.no': 'Arbeidsplassen',
    'karriere': 'Karriere',
    'karriere.no': 'Karriere',
    'frontend': 'Job', // Fix: Show "Job" instead of "frontend"
    'unknown': 'Ukjent kilde',
  };
  
  // Check if we have a mapping
  if (sourceMap[sourceLower]) {
    return sourceMap[sourceLower];
  }
  
  // Capitalize first letter if no mapping found
  return source.charAt(0).toUpperCase() + source.slice(1);
}

