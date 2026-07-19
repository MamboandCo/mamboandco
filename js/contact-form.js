/* ═══════════════════════════════════════════════════════════════
   contact-form.js — Mambo & Co
   Flux : Web3Forms (notification → Ophélie) +
          EmailJS    (confirmation → client)
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────────────────────────
     ⚙️  CONFIGURATION — À remplir avec vos propres clés
     ───────────────────────────────────────────────────────────── */

  var CONFIG = {
    /* Web3Forms — obtenez votre clé sur https://web3forms.com
       (gratuit, votre email sera l'adresse de réception) */
    web3forms: {
      accessKey: 'ec73e4ea-e45a-49ec-a92f-4d4b26ab817e'
    },

    /* EmailJS — compte sur https://emailjs.com
       Dashboard > Account > Public Key
       Dashboard > Email Services > Service ID
       Dashboard > Email Templates > Template ID */
    emailjs: {
      publicKey:  'TfqlU6Tjt4MMb8A4o',
      serviceId:  'service_o0p3r8m',
      templateId: 'template_98nc0rq'
      /*
        Dans votre template EmailJS, les variables disponibles sont :
        {{prenom}}       — prénom du client
        {{nom}}          — nom du client
        {{email}}        — email du client
        {{tel}}          — téléphone
        {{ville}}        — ville
        {{prestation}}   — prestation choisie (ex: "🏠 Visite à domicile")
        {{message}}      — le message du client
      */
    }
  };

  /* ─────────────────────────────────────────────────────────────
     Libellés lisibles pour les prestations (chips)
     ───────────────────────────────────────────────────────────── */
  var PRESTATIONS = {
    visite:             '🏠 Visite à domicile',
    visite_edu:         '🏠 Visite à domicile + 🎓 Option éducative',
    promenade:          '🦮 Promenade',
    promenade_edu:      '🦮 Promenade + 🎓 Option éducative',
    autre:              '💬 Autre'
  };

  /* ─────────────────────────────────────────────────────────────
     Initialisation EmailJS
     ───────────────────────────────────────────────────────────── */
  if (window.emailjs) {
    emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
  }

  /* ─────────────────────────────────────────────────────────────
     Chips — sélection de prestation
     ───────────────────────────────────────────────────────────── */
  var selectedPrestation = '';
  var selectedEdu = ''; // 'oui' | 'non' | ''

  /* Chips de prestation principale */
  document.querySelectorAll('.cf-chip[data-value]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.cf-chip[data-value]').forEach(function (c) {
        c.classList.remove('selected');
      });
      chip.classList.add('selected');
      selectedPrestation = chip.dataset.value;

      /* Affiche / masque le bloc éducatif selon la prestation */
      var eduBlock = document.getElementById('cf-edu-block');
      if (eduBlock) {
        if (selectedPrestation === 'visite' || selectedPrestation === 'promenade') {
          eduBlock.style.display = 'block';
        } else {
          eduBlock.style.display = 'none';
          /* Réinitialise le choix éducatif si on bascule sur "Autre" */
          selectedEdu = '';
          document.querySelectorAll('.cf-chip[data-edu]').forEach(function (c) {
            c.classList.remove('selected');
          });
        }
      }
    });
  });

  /* Chips Oui / Non éducation */
  document.querySelectorAll('.cf-chip[data-edu]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.cf-chip[data-edu]').forEach(function (c) {
        c.classList.remove('selected');
      });
      chip.classList.add('selected');
      selectedEdu = chip.dataset.edu;
    });
  });

  /* ─────────────────────────────────────────────────────────────
     Helpers
     ───────────────────────────────────────────────────────────── */
  function showError(msg) {
    var errBox = document.getElementById('cf-error');
    if (!errBox) return;
    errBox.innerHTML = msg;
    errBox.style.display = 'block';
  }

  function hideError() {
    var errBox = document.getElementById('cf-error');
    if (errBox) errBox.style.display = 'none';
  }

  function setLoading(btn, isLoading) {
    if (isLoading) {
      btn.classList.add('loading');
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = 'Envoi en cours…';
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.innerHTML = btn.dataset.originalHtml || 'Envoyer ma demande';
      btn.disabled = false;
    }
  }

  function showSuccess() {
    var formContent = document.getElementById('contact-form-content');
    var successMsg  = document.getElementById('contact-success');
    if (formContent) formContent.style.display = 'none';
    if (successMsg)  successMsg.style.display  = 'block';
  }

  /* ─────────────────────────────────────────────────────────────
     Envoi Web3Forms (notification vers Ophélie)
     ───────────────────────────────────────────────────────────── */
  function sendWeb3Forms(data) {
    var payload = {
      access_key:  CONFIG.web3forms.accessKey,
      subject:     '🐾 Nouvelle demande — ' + data.prestation + ' (' + data.ville + ')',
      from_name:   data.prenom + ' ' + data.nom,
      email:       data.email,
      /* Champs structurés visibles dans l'email reçu */
      Prénom:      data.prenom,
      Nom:         data.nom,
      Téléphone:   data.tel,
      Ville:       data.ville,
      Prestation:  data.prestation,
      Message:     data.message
    };

    return fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    }).then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Erreur Web3Forms');
        }
        return json;
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Envoi EmailJS (confirmation vers le client)
     ───────────────────────────────────────────────────────────── */
  function sendEmailJS(data) {
    if (!window.emailjs) {
      console.warn('EmailJS SDK non chargé — confirmation client ignorée.');
      return Promise.resolve();
    }

    /* Construction du récap formaté pour {{full_message}} dans le template */
    var full_message = [
      '👤 Nom & Prénom  : ' + data.prenom + ' ' + data.nom,
      '📞 Téléphone     : ' + data.tel,
      '✉️  Email          : ' + data.email,
      '📍 Ville          : ' + data.ville,
      '🐾 Prestation    : ' + data.prestation,
      '',
      '💬 Message :',
      data.message
    ].join('\n');

    return emailjs.send(
      CONFIG.emailjs.serviceId,
      CONFIG.emailjs.templateId,
      {
        prenom:        data.prenom,
        full_message:  full_message,
        /* L'adresse email du client, pour que EmailJS envoie bien À lui */
        email:         data.email
      }
    );
  }

  /* ─────────────────────────────────────────────────────────────
     Soumission du formulaire
     ───────────────────────────────────────────────────────────── */
  var btnSubmit = document.getElementById('cf-submit');
  if (!btnSubmit) return;

  btnSubmit.addEventListener('click', function () {
    /* 1. Récupération des valeurs */
    var nom     = document.getElementById('cf-nom').value.trim();
    var prenom  = document.getElementById('cf-prenom').value.trim();
    var tel     = document.getElementById('cf-tel').value.trim();
    var email   = document.getElementById('cf-email').value.trim();
    var ville   = document.getElementById('cf-ville').value.trim();
    var message = document.getElementById('cf-message').value.trim();
    var errors  = [];

    /* 2. Validation */
    if (!nom)                           errors.push('⚠ Votre nom est requis.');
    if (!prenom)                        errors.push('⚠ Votre prénom est requis.');
    if (!tel)                           errors.push('⚠ Votre numéro de téléphone est requis.');
    if (!email || !email.includes('@')) errors.push('⚠ Un email valide est requis.');
    if (!ville)                         errors.push('⚠ Votre ville est requise.');
    if (!selectedPrestation)            errors.push('⚠ Veuillez sélectionner une prestation.');
    /* Valider le choix éducatif uniquement si la prestation le propose */
    if ((selectedPrestation === 'visite' || selectedPrestation === 'promenade') && !selectedEdu) {
      errors.push('⚠ Veuillez indiquer si vous souhaitez l\'option éducative.');
    }
    if (!message)                       errors.push('⚠ Veuillez décrire votre besoin.');

    if (errors.length) {
      showError(errors.map(function (e) { return '<div>' + e + '</div>'; }).join(''));
      return;
    }

    hideError();
    setLoading(btnSubmit, true);

    /* Construire la clé de prestation (avec option éducative si applicable) */
    var prestationKey = selectedPrestation;
    if ((selectedPrestation === 'visite' || selectedPrestation === 'promenade') && selectedEdu === 'oui') {
      prestationKey = selectedPrestation + '_edu';
    }

    var formData = {
      nom:         nom,
      prenom:      prenom,
      tel:         tel,
      email:       email,
      ville:       ville,
      prestation:  PRESTATIONS[prestationKey] || prestationKey,
      message:     message
    };

    /* 3. Envoi Web3Forms (obligatoire) puis EmailJS (best-effort) */
    sendWeb3Forms(formData)
      .then(function () {
        /* Web3Forms OK → on envoie la confirmation client en parallèle,
           sans bloquer l'affichage du succès si EmailJS échoue */
        sendEmailJS(formData).catch(function (err) {
          console.warn('EmailJS — confirmation client non envoyée :', err);
        });
        showSuccess();
      })
      .catch(function (err) {
        console.error('Web3Forms error :', err);
        setLoading(btnSubmit, false);
        showError(
          '<div>⚠ Une erreur est survenue lors de l\'envoi. ' +
          'Veuillez réessayer ou nous contacter directement à ' +
          '<a href="mailto:contact@mamboandco.fr">contact@mamboandco.fr</a>.</div>'
        );
      });
  });

})();
