import fs from 'node:fs';

const path = 'src/pages/CareEncyclopedia.tsx';
let source = fs.readFileSync(path, 'utf8');

const before = `  useEffect(() => {
    const topicId = new URLSearchParams(location.search).get('topic');
    if (!topicId) {
      if (selectedTopic) setSelectedTopic(null);
      return;
    }
    if (selectedTopic?.id === topicId) return;
    openCareDetail(topicId, undefined, false);
  }, [location.search, selectedTopic?.id]);

  const closeCareDetail = () => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('topic')) {
      if (searchParams.get('source') === 'search') {
        navigate(-1);
        return;
      }
      navigateToRoute('/care');
      return;
    }
    setSelectedTopic(null);
    const context = detailNavigationContextRef.current;
    detailNavigationContextRef.current = null;
    if (context) void restoreContext(context);
  };`;

const after = `  useEffect(() => {
    const topicId = new URLSearchParams(location.search).get('topic');
    if (!topicId) return;
    openCareDetail(topicId, undefined, false);
  }, [location.search]);

  const closeCareDetail = () => {
    const searchParams = new URLSearchParams(location.search);
    setSelectedTopic(null);
    if (searchParams.has('topic')) {
      if (searchParams.get('source') === 'search') {
        navigate(-1);
        return;
      }
      navigateToRoute('/care');
      return;
    }
    const context = detailNavigationContextRef.current;
    detailNavigationContextRef.current = null;
    if (context) void restoreContext(context);
  };`;

const count = source.split(before).length - 1;
if (count !== 1) throw new Error(`Care topic sync anchor expected once, found ${count}`);
source = source.replace(before, after);
fs.writeFileSync(path, source);
console.log('Patched Care topic sync: deeplink follows location.search; browse detail remains local state.');
