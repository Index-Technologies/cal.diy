import type { CookieOption, CookiesOptions } from "next-auth";

/**
 * Copy from 'https://github.com/nextauthjs/next-auth/blob/227ff2259f/src/core/lib/cookie.ts' as we can't import it directly
 *
 * Use secure cookies if the site uses HTTPS
 * This being conditional allows cookies to work non-HTTPS development URLs
 * Honour secure cookie option, which sets 'secure' and also adds '__Secure-'
 * prefix, but enable them by default if the site URL is HTTPS; but not for
 * non-HTTPS URLs like http://localhost which are used in development).
 * For more on prefixes see https://googlechrome.github.io/samples/cookie-prefixes/
 *
 */

const NEXTAUTH_COOKIE_DOMAIN = process.env.NEXTAUTH_COOKIE_DOMAIN || "";
// Opt-in: force `SameSite=None; Secure` cookies even when WEBAPP_URL is http://.
// Needed when the dev server is fronted by an HTTPS reverse proxy that embeds the
// app in a cross-site iframe (e.g. the Alloy preview), because `SameSite=Lax`
// cookies are not sent on subresource requests issued from cross-site iframes.
const NEXTAUTH_FORCE_SECURE_COOKIES = process.env.NEXTAUTH_FORCE_SECURE_COOKIES === "true";

export function defaultCookies(useSecureCookies: boolean): CookiesOptions {
  const secure = useSecureCookies || NEXTAUTH_FORCE_SECURE_COOKIES;
  const cookiePrefix = secure ? "__Secure-" : "";

  const defaultOptions: CookieOption["options"] = {
    domain: NEXTAUTH_COOKIE_DOMAIN || undefined,
    // To enable cookies on widgets,
    // https://stackoverflow.com/questions/45094712/iframe-not-reading-cookies-in-chrome
    // But we need to set it as `lax` in development
    sameSite: secure ? "none" : "lax",
    path: "/",
    secure,
  };
  return {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        ...defaultOptions,
        httpOnly: true,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: defaultOptions,
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        ...defaultOptions,
        httpOnly: true,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        ...defaultOptions,
        httpOnly: true,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        ...defaultOptions,
        httpOnly: true,
      },
    },
    nonce: {
      name: `${cookiePrefix}next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: secure ? "none" : "lax",
        path: "/",
        secure,
      },
    },
  };
}
