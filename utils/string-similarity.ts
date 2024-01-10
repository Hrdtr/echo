/**
 * Compares the similarity between two strings using an n-gram comparison method.
 * The grams default to length 2.
 * @param str1 The first string to compare.
 * @param str2 The second string to compare.
 * @param gramSize The size of the grams. Defaults to length 2.
 */
export function stringSimilarity(str1: string, str2: string, gramSize: number = 2) {
  function getNGrams(s: string, len: number) {
    s = ' '.repeat(len - 1) + s.toLowerCase() + ' '.repeat(len - 1)
    const v: string[] = Array.from({ length: s.length - len + 1 })
    for (let i = 0; i < v.length; i++)
      v[i] = s.slice(i, i + len)

    return v
  }

  if (!str1?.length || !str2?.length) return 0.0

  // Order the strings by length so the order they're passed in doesn't matter
  // and so the smaller string's ngrams are always the ones in the set
  const s1 = str1.length < str2.length ? str1 : str2
  const s2 = str1.length < str2.length ? str2 : str1

  const pairs1 = getNGrams(s1, gramSize)
  const pairs2 = getNGrams(s2, gramSize)
  const set = new Set<string>(pairs1)

  const total = pairs2.length
  let hits = 0
  for (const item of pairs2) {
    if (set.delete(item))
      hits++
  }
  return hits / total
}
