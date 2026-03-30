// src/utils/redirect.ts
export const redirectTo = (url: string) => {
  // use replace to avoid leaving stale history entry and force navigation
  window.location.replace(url)
}