import fs from 'node:fs';

const file = 'src/pages/Aquarium.tsx';
const source = fs.readFileSync(file, 'utf8');

if (source.includes('data-dashboard-priority="today"')) {
  console.log('Aquarium Dashboard V2 already applied.');
  process.exit(0);
}

const startMarker = 'function AquariumZoneHeader(';
const endMarker = '\n\n\nconst getSubstrateLabelLocalized';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error('Could not locate Aquarium workspace layout anchors.');
}

const replacement = `function AquariumWorkspace({
  observeTitle,
  observeSubtitle,
  manageTitle,
  manageSubtitle,
  learnTitle,
  learnSubtitle,
  tank,
  status,
  archive,
  actions,
  discovery,
}: {
  observeTitle: string;
  observeSubtitle: string;
  manageTitle: string;
  manageSubtitle: string;
  learnTitle: string;
  learnSubtitle: string;
  tank: ReactNode;
  status: ReactNode;
  archive: ReactNode;
  actions: ReactNode;
  discovery: ReactNode;
}) {
  const location = useLocation();

  useEffect(() => {
    const target = \`${'${location.hash} ${location.search}'}\`;
    const targetId = /manage|add-species|settings|livestock/i.test(target)
      ? 'aquarium-manage-zone'
      : /learn|care|discovery|recommend/i.test(target)
        ? 'aquarium-learn-zone'
        : '';
    if (!targetId) return;
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (!element) return;
      element.classList.add('aquarium-zone-target');
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
      element.focus({ preventScroll: true });
      window.setTimeout(() => element.classList.remove('aquarium-zone-target'), 1200);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.search]);

  return (
    <main className="aquarium-dashboard-v2" data-aquarium-dashboard-v2>
      <section className="aquarium-dashboard-v2__hero" aria-label={observeTitle}>
        <div className="aquarium-dashboard-v2__decision" data-dashboard-priority="today">
          {status}
        </div>
        <div className="aquarium-dashboard-v2__context" data-dashboard-priority="context">
          {tank}
        </div>
      </section>

      <section
        id="aquarium-manage-zone"
        tabIndex={-1}
        className="aquarium-dashboard-v2__section aquarium-dashboard-v2__manage"
        aria-labelledby="aquarium-manage-title"
      >
        <header className="aquarium-dashboard-v2__section-heading">
          <div className="min-w-0">
            <div className="aquarium-dashboard-v2__section-kicker">{observeSubtitle}</div>
            <h2 id="aquarium-manage-title" className="aquarium-dashboard-v2__section-title">{manageTitle}</h2>
            {manageSubtitle && <p className="aquarium-dashboard-v2__section-copy">{manageSubtitle}</p>}
          </div>
        </header>
        <div className="aquarium-dashboard-v2__manage-grid">
          <div className="aquarium-dashboard-v2__manage-primary">{actions}</div>
          <div className="aquarium-dashboard-v2__manage-secondary">{archive}</div>
        </div>
      </section>

      {discovery && (
        <section
          id="aquarium-learn-zone"
          tabIndex={-1}
          className="aquarium-dashboard-v2__section aquarium-dashboard-v2__secondary"
          aria-labelledby="aquarium-learn-title"
          data-dashboard-priority="secondary"
        >
          <header className="aquarium-dashboard-v2__section-heading">
            <div className="min-w-0">
              <div className="aquarium-dashboard-v2__section-kicker">Explore</div>
              <h2 id="aquarium-learn-title" className="aquarium-dashboard-v2__section-title">{learnTitle}</h2>
              {learnSubtitle && <p className="aquarium-dashboard-v2__section-copy">{learnSubtitle}</p>}
            </div>
          </header>
          <div className="aquarium-dashboard-v2__secondary-content">{discovery}</div>
        </section>
      )}
    </main>
  );
}`;

const next = source.slice(0, start) + replacement + source.slice(end);
fs.writeFileSync(file, next);
console.log('Applied Aquarium Dashboard V2 layout hierarchy.');
