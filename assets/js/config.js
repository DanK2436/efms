/**
 * EFMS public API config — no Supabase secrets here.
 * Set <meta name="efms-api-base" content="https://your-api.example.com">
 * or localStorage.efms_api_base. Empty = same-origin (/api/...).
 */
(function (global) {
  const meta = document.querySelector('meta[name="efms-api-base"]');
  const fromMeta = meta && meta.getAttribute('content') != null
    ? meta.getAttribute('content').trim()
    : null;
  const fromStorage = (() => {
    try { return localStorage.getItem('efms_api_base'); } catch (_) { return null; }
  })();

  let base = fromMeta !== null && fromMeta !== ''
    ? fromMeta
    : (fromStorage || '');

  if (!base) {
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      base = 'http://localhost:3000';
    }
  }

  base = String(base).replace(/\/$/, '');

  function apiUrl(path) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.EFMS = {
    apiBase: base,
    apiUrl,
    escapeHtml,
  };
})(window);
