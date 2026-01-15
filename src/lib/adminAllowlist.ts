// Admin allowlist - users with these emails bypass subscription check
// Set via VITE_ADMIN_EMAILS env var (comma-separated)
// Example: VITE_ADMIN_EMAILS="admin@example.com, owner@example.com"

const ADMIN_EMAILS_RAW = import.meta.env.VITE_ADMIN_EMAILS || 'victoracoelho22@gmail.com';

export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter((email: string) => email.length > 0);

/**
 * Check if an email is in the admin allowlist
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
