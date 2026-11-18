/* ================= Boot ================= */
applyTheme();
render();
if (!S.profile.onboarded) setTimeout(onboarding, 300);
if (squadState().configured) fbInit();
// register service worker for offline use / install (only works when hosted, e.g. GitHub Pages)
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|claudeusercontent/.test(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
// keep streak display fresh if the tab stays open past midnight
setInterval(renderChrome, 60 * 1000);
window.addEventListener('storage', e => { if (e.key === STORE_KEY) { load(); applyTheme(); render(); } });
