/* ═══════════════════════════════════════════════════════════════
   parcours.js — Mambo & Co
   Drag-scroll horizontal du carrousel Parcours
═══════════════════════════════════════════════════════════════ */

(function () {
  var wrap = document.getElementById('parcoursScroll');
  if (!wrap) return;
  var isDown = false, startX, scrollLeft;
  wrap.addEventListener('mousedown', function (e) {
    isDown = true; startX = e.pageX - wrap.offsetLeft; scrollLeft = wrap.scrollLeft;
  });
  wrap.addEventListener('mouseleave', function () { isDown = false; });
  wrap.addEventListener('mouseup',    function () { isDown = false; });
  wrap.addEventListener('mousemove',  function (e) {
    if (!isDown) return;
    e.preventDefault();
    wrap.scrollLeft = scrollLeft - (e.pageX - wrap.offsetLeft - startX);
  });
})();