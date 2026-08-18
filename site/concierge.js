(() => {
  const paths = {
    root: window.location.pathname.includes('/products/') || window.location.pathname.includes('/downloads/') ? '../' : '',
    free: 'free-products.html',
    signup: 'email-signup.html'
  };
  const root = paths.root;

  const recommendations = {
    simplify: {
      title: 'Start with the free 3-minute guide',
      copy: 'Use the five ritual roles to see what you already own, remove duplicates, and choose one repeatable starting point.',
      href: `${root}${paths.free}`,
      label: 'Open the free starter path'
    },
    consistency: {
      title: 'Preview the 7-Day Body Ritual Guide',
      copy: 'A one-week structure is the clearest next step when you know the basics but need a routine you can actually repeat.',
      href: `${root}products/7-day-body-ritual-guide.html`,
      label: 'Preview the 7-day guide'
    },
    scent: {
      title: 'Preview the Glow + Scent Bundle',
      copy: 'Build one coordinated body-care and scent routine without stacking products that compete or add clutter.',
      href: `${root}products/glow-scent-bundle.html`,
      label: 'Preview the bundle'
    },
    planning: {
      title: 'Preview the Self-Care Planner',
      copy: 'Use a weekly plan, product-role map, shopping filter, and monthly review to make the ritual easier to maintain.',
      href: `${root}products/self-care-planner.html`,
      label: 'Preview the planner'
    },
    home: {
      title: 'Preview the Bathroom Reset Cards',
      copy: 'Use short visual checklists to reduce product clutter and leave the space ready for the next routine.',
      href: `${root}products/bathroom-reset-cards.html`,
      label: 'Preview the reset cards'
    }
  };

  const launcher = document.createElement('button');
  launcher.className = 'concierge-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<span aria-hidden="true">✦</span><span>Ritual Concierge</span>';

  const panel = document.createElement('section');
  panel.className = 'concierge-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'conciergeTitle');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="concierge-head">
      <div><p class="eyebrow">Automated guide</p><h2 id="conciergeTitle">What would make your routine easier?</h2></div>
      <button class="concierge-close" type="button" aria-label="Close Ritual Concierge">×</button>
    </div>
    <p class="concierge-intro">Choose the closest fit. This guide recommends a Kunta Naturals resource; it is not a person or medical advisor.</p>
    <div class="concierge-options" role="list">
      <button type="button" data-path="simplify">I own too many random products</button>
      <button type="button" data-path="consistency">I need a routine I can repeat</button>
      <button type="button" data-path="scent">I want body care and scent to work together</button>
      <button type="button" data-path="planning">I need a weekly plan</button>
      <button type="button" data-path="home">I need a calmer bathroom setup</button>
    </div>
    <div class="concierge-result" role="status" aria-live="polite"></div>`;

  document.body.append(launcher, panel);
  const close = panel.querySelector('.concierge-close');
  const result = panel.querySelector('.concierge-result');

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('concierge-open', open);
    if (open) panel.querySelector('[data-path]')?.focus();
    else launcher.focus();
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));
  panel.addEventListener('click', (event) => {
    const option = event.target.closest('[data-path]');
    if (!option) return;
    const recommendation = recommendations[option.dataset.path];
    if (!recommendation) return;
    panel.querySelectorAll('[data-path]').forEach((button) => button.setAttribute('aria-pressed', String(button === option)));
    result.innerHTML = `<p class="eyebrow">Your simplest next step</p><h3>${recommendation.title}</h3><p>${recommendation.copy}</p><a class="button primary" href="${recommendation.href}">${recommendation.label}</a>`;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
})();
