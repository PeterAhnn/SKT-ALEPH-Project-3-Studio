// Run before the stylesheet so a saved dark theme never flashes light on load.
(() => {
  const key = 'jjal-studio-theme';
  const choices = ['system', 'light', 'dark'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try {
    const saved = localStorage.getItem(key);
    if (choices.includes(saved)) preference = saved;
  } catch { /* Theme switching still works when browser storage is unavailable. */ }
  function apply() {
    const resolved = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
    const control = document.getElementById('theme-select');
    if (control) {
      control.value = preference;
      control.title = preference === 'system' ? `시스템 설정 사용 중: ${resolved === 'dark' ? '다크' : '라이트'}` : '화면 테마';
    }
  }
  apply();
  media.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = choices.includes(event.newValue) ? event.newValue : 'system';
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-select').addEventListener('change', event => {
      preference = choices.includes(event.target.value) ? event.target.value : 'system';
      apply();
      try { localStorage.setItem(key, preference); }
      catch {
        const notice = document.getElementById('status');
        notice.textContent = '테마를 바꿨어요. 브라우저 저장이 차단되어 다음 방문에는 시스템 설정을 따릅니다.';
        notice.classList.add('error');
      }
    });
  });
})();
