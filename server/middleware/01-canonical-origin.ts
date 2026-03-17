import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const canonicalOrigin = useRuntimeConfig().canonicalOrigin as string
  if (!canonicalOrigin) return

  let canonicalUrl: URL
  try {
    canonicalUrl = new URL(canonicalOrigin)
  } catch {
    return
  }

  const requestUrl = getRequestURL(event)
  if (requestUrl.host === canonicalUrl.host) return

  const target = `${canonicalUrl.origin}${requestUrl.pathname}${requestUrl.search}`
  return sendRedirect(event, target, 308)
})
