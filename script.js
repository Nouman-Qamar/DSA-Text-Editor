document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');

  // ===== UNDO / REDO — two Stacks =====
  const undoStack = new Stack();
  const redoStack = new Stack();
  let lastSnapshot = '';
  let typingTimer = null;
  const SNAPSHOT_DELAY = 500; // ms pause before a snapshot is pushed

  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const resetBtn = document.getElementById('resetBtn');

  function pushSnapshot(force = false) {
    const value = editor.value;
    if (value === lastSnapshot) return;
    undoStack.push(lastSnapshot);
    lastSnapshot = value;
    redoStack.clear(); // any new edit invalidates the redo history
    renderStacks();
    updateButtons();
  }

  editor.addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(pushSnapshot, SNAPSHOT_DELAY);
    updateStats();
    updateWordFrequency();
    // Any edit invalidates previously found match positions
    currentMatches = [];
    matchCursor = -1;
  });

  undoBtn.addEventListener('click', () => {
    if (undoStack.isEmpty()) return;
    redoStack.push(editor.value);
    const prev = undoStack.pop();
    editor.value = prev;
    lastSnapshot = prev;
    renderStacks();
    updateButtons();
    updateStats();
    updateWordFrequency();
  });

  redoBtn.addEventListener('click', () => {
    if (redoStack.isEmpty()) return;
    undoStack.push(editor.value);
    const next = redoStack.pop();
    editor.value = next;
    lastSnapshot = next;
    renderStacks();
    updateButtons();
    updateStats();
    updateWordFrequency();
  });

  resetBtn.addEventListener('click', () => {
    if (editor.value && !confirm('Clear the editor and reset history?')) return;
    editor.value = '';
    lastSnapshot = '';
    undoStack.clear();
    redoStack.clear();
    renderStacks();
    updateButtons();
    updateStats();
    updateWordFrequency();
  });

  document.addEventListener('keydown', (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      pushSnapshot();
      undoBtn.click();
    } else if (meta && (e.key.toLowerCase() === 'y')) {
      e.preventDefault();
      redoBtn.click();
    } else if (meta && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      switchTab('search');
      document.getElementById('findInput').focus();
    }
  });

  function updateButtons() {
    undoBtn.disabled = undoStack.isEmpty();
    redoBtn.disabled = redoStack.isEmpty();
  }

  function preview(text) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return '(empty)';
    return clean.length > 28 ? clean.slice(0, 28) + '…' : clean;
  }

  function renderStackColumn(stack, containerId, countId) {
    const container = document.getElementById(containerId);
    document.getElementById(countId).textContent = `(${stack.size})`;
    const items = stack.toArray(); // top-first
    if (items.length === 0) {
      container.innerHTML = '<div class="stack-empty">empty</div>';
      return;
    }
    container.innerHTML = items
      .map((snap, idx) => {
        const topClass = idx === 0 ? ' is-top' : '';
        return `<div class="stack-card${topClass}">${escapeHtml(preview(snap))}</div>`;
      })
      .join('');
  }

  function renderStacks() {
    renderStackColumn(undoStack, 'undoStackVisual', 'undoCount');
    renderStackColumn(redoStack, 'redoStackVisual', 'redoCount');
  }

  // ===== STATS =====
  function updateStats() {
    const text = editor.value;
    const words = (text.match(/\S+/g) || []).length;
    const chars = text.length;
    const lines = text === '' ? 1 : text.split('\n').length;
    const readMins = Math.max(1, Math.round(words / 200));
    document.getElementById('statWords').textContent = `${words} word${words === 1 ? '' : 's'}`;
    document.getElementById('statChars').textContent = `${chars} char${chars === 1 ? '' : 's'}`;
    document.getElementById('statLines').textContent = `${lines} line${lines === 1 ? '' : 's'}`;
    document.getElementById('statReadTime').textContent = text.trim()
      ? `~${readMins} min read`
      : '<1 min read';
  }

  // ===== TABS =====
  const tabs = document.querySelectorAll('.tab');
  function switchTab(name) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('is-active', p.id === `panel-${name}`);
    });
  }
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  // ===== FIND & REPLACE (KMP) =====
  const findInput = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  const caseSensitive = document.getElementById('caseSensitive');
  const matchStatus = document.getElementById('matchStatus');
  let currentMatches = [];
  let matchCursor = -1;

  function runSearch() {
    const pattern = findInput.value;
    if (!pattern) {
      currentMatches = [];
      matchCursor = -1;
      matchStatus.textContent = 'No search yet';
      return [];
    }
    currentMatches = kmpSearch(editor.value, pattern, caseSensitive.checked);
    matchCursor = -1;
    matchStatus.textContent = currentMatches.length
      ? `${currentMatches.length} match${currentMatches.length === 1 ? '' : 'es'} found`
      : 'No matches';
    return currentMatches;
  }

  document.getElementById('findBtn').addEventListener('click', () => {
    const pattern = findInput.value;
    if (!pattern) return;
    // Re-run search if the text or pattern changed since last time
    if (matchCursor === -1 || currentMatches.length === 0) {
      runSearch();
    }
    if (currentMatches.length === 0) return;
    matchCursor = (matchCursor + 1) % currentMatches.length;
    const start = currentMatches[matchCursor];
    const end = start + pattern.length;
    editor.focus();
    editor.setSelectionRange(start, end);
    matchStatus.textContent = `Match ${matchCursor + 1} of ${currentMatches.length}`;
  });

  document.getElementById('replaceBtn').addEventListener('click', () => {
    const pattern = findInput.value;
    const replacement = replaceInput.value;
    if (!pattern || matchCursor === -1 || currentMatches.length === 0) {
      matchStatus.textContent = 'Find a match first';
      return;
    }
    const start = currentMatches[matchCursor];
    const end = start + pattern.length;
    editor.value = editor.value.slice(0, start) + replacement + editor.value.slice(end);
    pushSnapshot();
    updateStats();
    updateWordFrequency();
    runSearch(); // recompute matches against the updated text
    matchStatus.textContent = currentMatches.length
      ? `${currentMatches.length} match${currentMatches.length === 1 ? '' : 'es'} remaining`
      : 'All matches replaced';
  });

  document.getElementById('replaceAllBtn').addEventListener('click', () => {
    const pattern = findInput.value;
    const replacement = replaceInput.value;
    if (!pattern) return;
    const matches = kmpSearch(editor.value, pattern, caseSensitive.checked);
    if (matches.length === 0) {
      matchStatus.textContent = 'No matches to replace';
      return;
    }
    let result = '';
    let cursor = 0;
    for (const start of matches) {
      result += editor.value.slice(cursor, start) + replacement;
      cursor = start + pattern.length;
    }
    result += editor.value.slice(cursor);
    editor.value = result;
    pushSnapshot();
    updateStats();
    updateWordFrequency();
    currentMatches = [];
    matchCursor = -1;
    matchStatus.textContent = `Replaced ${matches.length} occurrence${matches.length === 1 ? '' : 's'}`;
  });

  findInput.addEventListener('input', () => {
    matchCursor = -1;
  });

  // ===== WORD FREQUENCY (HashMap) =====
  function wordFrequency(text, topN = 10) {
    const words = text.toLowerCase().match(/[a-z']+/g) || [];
    const freq = Object.create(null);
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
    const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return { total: words.length, unique: entries.length, top: entries.slice(0, topN) };
  }

  function updateWordFrequency() {
    const { total, unique, top } = wordFrequency(editor.value);
    document.getElementById('freqSummary').textContent = `${total} word${total === 1 ? '' : 's'} · ${unique} unique`;
    const list = document.getElementById('freqList');
    if (top.length === 0) {
      list.innerHTML = '<div class="stack-empty">Start typing to see word frequency</div>';
      return;
    }
    const max = top[0][1];
    list.innerHTML = top
      .map(([word, count]) => {
        const pct = Math.max(8, Math.round((count / max) * 100));
        return `
          <div class="freq-row">
            <span class="freq-word">${escapeHtml(word)}</span>
            <span class="freq-bar-track"><span class="freq-bar-fill" style="width:${pct}%"></span></span>
            <span class="freq-count">${count}</span>
          </div>`;
      })
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ===== INIT =====
  renderStacks();
  updateButtons();
  updateStats();
  updateWordFrequency();
});
