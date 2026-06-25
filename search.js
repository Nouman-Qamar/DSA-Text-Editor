/**
 * Knuth-Morris-Pratt substring search.
 * Used for Find & Replace — O(n + m) instead of the naive O(n*m) scan,
 * which matters once the document gets long.
 */
function buildLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

function kmpSearch(text, pattern, caseSensitive = true) {
  if (!pattern) return [];
  const t = caseSensitive ? text : text.toLowerCase();
  const p = caseSensitive ? pattern : pattern.toLowerCase();
  const lps = buildLPS(p);
  const matches = [];
  let i = 0, j = 0;
  while (i < t.length) {
    if (t[i] === p[j]) {
      i++;
      j++;
    }
    if (j === p.length) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < t.length && t[i] !== p[j]) {
      if (j > 0) j = lps[j - 1];
      else i++;
    }
  }
  return matches;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { kmpSearch, buildLPS };
}
