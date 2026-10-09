import type { CatalogEvidenceSource } from '../../packages/contracts/src';

/** Sources opened and reviewed for Knowledge Completion Program Phase 2 Batch 1. */
export const phase2Batch01Sources: CatalogEvidenceSource[] = [
  {
    id: 'aquarium-industries-ramirezi-care-sheet',
    title: 'Ramirezi Blue Cichlid care sheet',
    publisher: 'Aquarium Industries',
    url: 'https://www.aquariumindustries.com.au/wp-content/uploads/2015/03/Ramirezi.pdf',
    sourceType: 'curated_husbandry',
    reviewStatus: 'reviewed',
  },
  {
    id: 'jstage-rhodeus-ocellatus-reproductive-cycle',
    title: 'Role of Temperature and Photoperiod in Annual Reproductive Cycle of the Rose Bitterling Rhodeus ocellatus ocellatus',
    publisher: 'Nippon Suisan Gakkaishi / J-STAGE',
    url: 'https://www.jstage.jst.go.jp/article/suisan1932/49/1/49_1_61/_article',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  },
];
