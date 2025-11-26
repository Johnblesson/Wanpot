document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.note').forEach(noteEl => {
    const contentEl = noteEl.querySelector('.content');
    const raw = (contentEl.dataset.full || '').replace(/\\n/g, '\n');
    contentEl.innerHTML = truncatedHtmlFromText(raw, 100);
  });
});

// Helper functions
function truncatedHtmlFromText(text, wordLimit = 100) {
  if (!text) return '';
  const paras = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) return paras.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  let count = 0;
  const outParas = [];
  for (const p of paras) {
    const pWords = p.split(/\s+/).filter(Boolean);
    if (count + pWords.length <= wordLimit) {
      outParas.push(`<p>${escapeHtml(p)}</p>`);
      count += pWords.length;
    } else {
      const remaining = wordLimit - count;
      if (remaining > 0) outParas.push(`<p>${escapeHtml(pWords.slice(0, remaining).join(' '))}...</p>`);
      break;
    }
  }
  return outParas.join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
