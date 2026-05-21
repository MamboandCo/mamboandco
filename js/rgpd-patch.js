/* ═══════════════════════════════════════════════════════════════
   rgpd-patch.js — Mambo & Co
   Validation des cases RGPD avant soumission du formulaire
   (doit être chargé AVANT contact-form.js)
═══════════════════════════════════════════════════════════════ */

/* ── Patch RGPD validation sur le formulaire contact ── */
(function () {
  var btn = document.getElementById('cf-submit');
  if (!btn) return;
  /* On intercepte le clic avant contact-form.js en phase capture */
  btn.addEventListener('click', function (e) {
    var r1 = document.getElementById('cf-rgpd1');
    var r2 = document.getElementById('cf-rgpd2');
    if (!r1 || !r1.checked || !r2 || !r2.checked) {
      e.stopImmediatePropagation();
      var errBox = document.getElementById('cf-error');
      if (errBox) {
        errBox.textContent = 'Veuillez cocher les deux cases de consentement RGPD pour continuer.';
        errBox.style.display = 'block';
      }
    }
  }, true /* capture = avant contact-form.js */);
})();