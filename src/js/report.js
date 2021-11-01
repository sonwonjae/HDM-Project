// Constant Number-------------
const EXECUTE_AFTER_MILLISECOND = 100;
const SCROLL_DOWN_PAGE_Y = 200;

// DOM Nodes--------------------
const $scrollUp = document.querySelector('.scroll-up');
// Event Binding----------------

window.onscroll = _.throttle(() => {
  window.pageYOffset > SCROLL_DOWN_PAGE_Y ? ($scrollUp.style.display = 'block') : ($scrollUp.style.display = 'none');
}, EXECUTE_AFTER_MILLISECOND);

$scrollUp.onclick = () => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  });
};
