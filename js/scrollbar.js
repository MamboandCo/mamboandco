/* ═══════════════════════════════════════════════
   Mambo&Co — scrollbar.js
═══════════════════════════════════════════════ */
(function () {
  var thumb = document.createElement('div');
  thumb.id = 'custom-scrollbar-thumb';
  document.body.appendChild(thumb);

  var html   = document.documentElement;
  var THUMB_H = 60; /* hauteur fixe en px */

  thumb.style.height = THUMB_H + 'px';

  function vh() { return window.visualViewport ? window.visualViewport.height : window.innerHeight; }
  function dh() { return html.scrollHeight - vh(); }

  function syncThumb() {
    var d = dh(), v = vh();
    thumb.style.transform = 'translateY(' + (d > 0 ? (window.scrollY / d) * (v - THUMB_H) : 0) + 'px)';
  }

  var startY = 0, startScroll = 0;

  thumb.addEventListener('pointerdown', function (e) {
    startY      = e.clientY;
    startScroll = window.scrollY;
    html.style.scrollBehavior = 'auto';
    thumb.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  thumb.addEventListener('pointermove', function (e) {
    if (!thumb.hasPointerCapture(e.pointerId)) return;
    var d = dh(), v = vh();
    var ratio = d / (v - THUMB_H);
    window.scrollTo(0, Math.min(Math.max(startScroll + (e.clientY - startY) * ratio, 0), d));
  });

  thumb.addEventListener('pointerup', function (e) {
    thumb.releasePointerCapture(e.pointerId);
    html.style.scrollBehavior = '';
  });

  thumb.addEventListener('pointercancel', function (e) {
    thumb.releasePointerCapture(e.pointerId);
    html.style.scrollBehavior = '';
  });

  window.addEventListener('scroll', syncThumb, { passive: true });
  window.addEventListener('resize', syncThumb);
  syncThumb();
})();
