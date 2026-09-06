export function bindSkipLink(): void {
  const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link[href="#main"]');
  const main = document.querySelector<HTMLElement>('main#main');
  if (!skipLink || !main) return;

  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    if (location.hash !== '#main') history.pushState(null, '', '#main');
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  });
}
