/**
 * This function creates a debounced version of a given function.
 *
 * @param {Function} func - The function to be debounced.
 * @param {number} waitFor - The time in milliseconds to wait before invoking the debounced function.
 * @return {Function} - The debounced function.
 */
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced as (...args: Parameters<F>) => ReturnType<F>
}
