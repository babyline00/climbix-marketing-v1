import * as React from "react"

const MOBILE_BREAKPOINT = 768

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/**
 * The server has no viewport, so it always reports the desktop branch and the
 * real value is adopted on the client's first render. Passing a distinct
 * getServerSnapshot is what keeps that swap from being a hydration mismatch.
 */
function getServerSnapshot() {
  return false
}

/**
 * useSyncExternalStore rather than useState + useEffect: the previous version
 * seeded state from an effect, which meant every consumer rendered `false`
 * once and then re-rendered after mount. Subscribing to matchMedia directly
 * gives the same value in the first client render.
 */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    getServerSnapshot
  )
}