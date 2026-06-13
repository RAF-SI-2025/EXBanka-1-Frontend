// Whether `value` is a syntactically valid http(s) URL. Shared by Create and
// Edit dialogs in this view to validate the base URL before submission.
export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
