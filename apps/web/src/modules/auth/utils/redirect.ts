export function resolveAuthRedirectTarget(
  target: string | null | undefined,
  fallbackPath: string,
) {
  if (!target) {
    return fallbackPath;
  }

  try {
    const url = new URL(target, window.location.origin);

    return `${url.pathname}${url.search}${url.hash}` || fallbackPath;
  } catch {
    return fallbackPath;
  }
}
