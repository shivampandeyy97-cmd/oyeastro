/**
 * Google Analytics 4 event helpers for OyeAstro
 * GA Property: G-4V01ML9C58
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

const GA_ID = 'G-4V01ML9C58'

/** Fire a GA4 custom event */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, { send_to: GA_ID, ...params })
}

/** Session keys to track which features have been used */
const SESSION_KEY_COSMIC = 'oya_cosmic_used'
const SESSION_KEY_COMPAT  = 'oya_compat_used'

/**
 * Call when a user successfully gets their Cosmic Vibe card.
 * Fires `cosmic_match_used`.
 * If they already used compatibility, also fires `cosmic_couple_used`.
 */
export function trackCosmicUsed() {
  sessionStorage.setItem(SESSION_KEY_COSMIC, '1')
  trackEvent('cosmic_match_used')

  if (sessionStorage.getItem(SESSION_KEY_COMPAT) === '1') {
    trackEvent('cosmic_couple_used')
  }
}

/**
 * Call when a user successfully checks Compatibility.
 * Fires `compatibility_match_used`.
 * If they already used cosmic, also fires `cosmic_couple_used`.
 */
export function trackCompatibilityUsed() {
  sessionStorage.setItem(SESSION_KEY_COMPAT, '1')
  trackEvent('compatibility_match_used')

  if (sessionStorage.getItem(SESSION_KEY_COSMIC) === '1') {
    trackEvent('cosmic_couple_used')
  }
}
