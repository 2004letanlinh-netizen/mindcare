import { dashboardPage } from './pages/dashboard.js';
import { communityPage } from './pages/community.js';
import { checkInPage } from './pages/check-in.js';
import { libraryPage } from './pages/library.js';
import { accountPage } from './pages/account.js';

const routes = {
  '/': dashboardPage,
  '/community': communityPage,
  '/check-in': checkInPage,
  '/library': libraryPage,
  '/account': accountPage
};

export function startRouter() {
  const outlet = document.querySelector('#app');
  let cleanup = () => {};

  function render() {
    cleanup();
    const path = window.location.hash.slice(1).split('?')[0] || '/';
    const page = routes[path] || dashboardPage;
    outlet.innerHTML = page.render();
    cleanup = page.mount?.(outlet) || (() => {});
    document.querySelectorAll('[data-route]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.route === path);
    });
    outlet.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', render);
  render();
}
