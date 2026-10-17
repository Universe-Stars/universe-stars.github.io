/**
 * main.js 全局脚本：主题初始化、骨架屏、基础导航、ViewTransition
 */
(function(){
  // ========== 骨架屏控制 ==========
  const skeletonWrap = document.getElementById('skeletonWrap');
  const mainContent = document.getElementById('mainContent');
  function removeSkeleton() {
    if(!skeletonWrap || !mainContent) return;
    skeletonWrap.classList.add('skeleton-hide');
    mainContent.style.opacity = '1';
  }
  window.addEventListener('load', removeSkeleton);
  setTimeout(removeSkeleton, 3000);

  // ========== 主题初始化 FOUC防护（放在最前面） ==========
  (function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();

  // ========== 涟漪主题切换 ViewTransition ==========
  window.toggleTheme = function toggleTheme(event) {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const switchTheme = () => {
      if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    };
    if (document.startViewTransition && event) {
      const x = event.clientX;
      const y = event.clientY;
      html.style.setProperty('--ripple-x', `${x}px`);
      html.style.setProperty('--ripple-y', `${y}px`);
      const t = document.startViewTransition(switchTheme);
      t.finished.then(() => {
        html.style.removeProperty('--ripple-x');
        html.style.removeProperty('--ripple-y');
      });
    } else {
      switchTheme();
    }
  }

  // ========== 浏览器 Navigation API 页面后退转场 ==========
  if (window.navigation) {
    navigation.addEventListener('navigate', (event) => {
      const { traversalType } = event;
      if (traversalType === 'back' || traversalType === 'forward') {
        if (document.startViewTransition) {
          event.intercept({
            async handler() {
              document.documentElement.classList.add('is-back-transition');
              const t = document.startViewTransition();
              await t.finished;
              document.documentElement.classList.remove('is-back-transition');
            }
          })
        }
      }
    });
  }

  // ========== 汉堡菜单绑定 ==========
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('#main-nav');
  const themeToggleBtn = document.getElementById('themeToggle');
  if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => toggleTheme(e));
  }
  hamburger?.addEventListener('click', ()=>{
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('rotate', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // ========== 当前导航链接高亮 ==========
  document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('#main-nav a');
    const currentPath = window.location.pathname;
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (currentPath === href || currentPath.endsWith(href)) {
        link.classList.add('active');
      }
    });
  })
})();
