// Every admin path is built from this prefix, so the nav, the redirect check
// and the proxy matcher cannot drift apart.
export const ADMIN = "/admin";
export const ADMIN_LOGIN = `${ADMIN}/login`;
export const ADMIN_MFA = `${ADMIN}/mfa`;

export const adminPath = {
  home: ADMIN,
  money: `${ADMIN}/money`,
  clients: `${ADMIN}/clients`,
  client: (id: string) => `${ADMIN}/clients/${encodeURIComponent(id)}`,
  pipeline: `${ADMIN}/pipeline`,
  history: `${ADMIN}/history`,
} as const;

/** True for /admin and anything under it. */
export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN || pathname.startsWith(`${ADMIN}/`);
}
