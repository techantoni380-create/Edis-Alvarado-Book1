(() => {
  const dialog = document.getElementById('image-viewer');
  const picture = document.getElementById('viewer-image');
  const title = document.getElementById('viewer-title');
  const area = document.querySelector('.viewer-image-area');
  const download = document.getElementById('viewer-download');
  const previous = document.getElementById('viewer-prev');
  const next = document.getElementById('viewer-next');
  const zoom = document.getElementById('viewer-zoom');
  let filter = 'all';
  let current = null;
  let opener = null;
  const t = key => translations[language][key];
  const selection = () => galleryImages.filter(item => item.category && (filter === 'all' || item.category === filter));

  function refreshLabels() {
    document.querySelectorAll('.poster-open').forEach(button => {
      const item = galleryImages.find(entry => entry.id === button.dataset.image);
      button.setAttribute('aria-label', `${t('expand')}: ${t(item.titleKey)}`);
    });
    const visible = selection().length;
    document.getElementById('gallery-count').textContent = language === 'en' ? `${visible} of 15 posters` : `${visible} de 15 carteles`;
    document.querySelector('.gallery-filters').setAttribute('aria-label',language === 'en' ? 'Filter posters' : 'Filtrar carteles');
    if (current) {
      title.textContent = t(current.titleKey);
      picture.alt = t(current.titleKey);
    }
    zoom.textContent = t(area.classList.contains('is-zoomed') ? 'fit' : 'zoom');
  }

  function showImage(item) {
    current = item;
    picture.src = item.src;
    download.href = item.src;
    download.download = item.src.split('/').pop();
    area.classList.remove('is-zoomed');
    area.scrollTop = 0;
    area.scrollLeft = 0;
    previous.hidden = next.hidden = !item.category;
    refreshLabels();
  }

  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      const item = galleryImages.find(entry => entry.id === button.dataset.image);
      if (!item) return;
      opener = button;
      showImage(item);
      dialog.showModal();
      document.body.classList.add('viewer-active');
      document.getElementById('viewer-close').focus();
    });
  });
  document.getElementById('viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-active');
    opener?.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  function step(direction) {
    if (!current?.category) return;
    const items = selection();
    const index = items.findIndex(item => item.id === current.id);
    showImage(items[(index + direction + items.length) % items.length]);
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', event => {
    if (!area.classList.contains('is-zoomed') && ['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  zoom.addEventListener('click', () => {area.classList.toggle('is-zoomed');refreshLabels();});
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
      document.querySelectorAll('.gallery-card').forEach(card => {card.hidden = filter !== 'all' && card.dataset.category !== filter;});
      refreshLabels();
    });
  });
  document.addEventListener('languagechange',refreshLabels);
  refreshLabels();
})();
