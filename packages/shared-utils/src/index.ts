/**
 * @pathforge/shared-utils
 * Utility functions shared across frontend and backend.
 */

// ─── Date Formatters ──────────────────────────────────────────────

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: string | Date, locale = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date, locale = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ─── String Formatters ────────────────────────────────────────────

/**
 * Convert name to initials (e.g., "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Capitalize first letter of each word
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

// ─── Profile Utilities ────────────────────────────────────────────

/**
 * Calculate profile completion percentage
 */
export function getProfileCompletion(profile: {
  college?: string | null;
  branch?: string | null;
  degree?: string | null;
  currentYear?: number | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  bio?: string | null;
  profileImage?: string | null;
}): number {
  const fields = [
    profile.college,
    profile.branch,
    profile.degree,
    profile.currentYear,
    profile.graduationYear,
    profile.cgpa,
    profile.bio,
    profile.profileImage,
  ];
  const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Format CGPA for display
 */
export function formatCgpa(cgpa: number | null | undefined): string {
  if (cgpa === null || cgpa === undefined) return 'N/A';
  return cgpa.toFixed(2);
}

// ─── Validation Utilities ─────────────────────────────────────────

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Misc Utilities ───────────────────────────────────────────────

/**
 * Sleep for a given number of milliseconds (useful for testing)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random hex color
 */
export function randomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

/**
 * Deep clone an object (JSON-safe)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
