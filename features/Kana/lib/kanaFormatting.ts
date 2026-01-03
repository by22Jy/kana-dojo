import { kana } from '@/features/Kana/data/kana';

export const getKanaGroupNames = (kanaGroupIndices: number[]) => {
  const selected = new Set(kanaGroupIndices);

  // Parent group definitions (for "All Hiragana", "All Katakana", "All Challenge")
  const parentGroupDefs: Array<{
    label: string;
    start: number;
    end: number;
  }> = [
    { label: 'All Hiragana', start: 0, end: 26 },
    { label: 'All Katakana', start: 26, end: 60 },
    { label: 'All Challenge', start: 60, end: 69 }
  ];

  const subgroupDefs: Array<{
    label: string;
    start: number;
    end: number;
    isChallenge: boolean;
  }> = [
    { label: 'Hiragana Base', start: 0, end: 10, isChallenge: false },
    { label: 'Hiragana Dakuon', start: 10, end: 15, isChallenge: false },
    { label: 'Hiragana Yoon', start: 15, end: 26, isChallenge: false },
    { label: 'Katakana Base', start: 26, end: 36, isChallenge: false },
    { label: 'Katakana Dakuon', start: 36, end: 41, isChallenge: false },
    { label: 'Katakana Yoon', start: 41, end: 52, isChallenge: false },
    {
      label: 'Katakana Foreign Sounds',
      start: 52,
      end: 60,
      isChallenge: false
    },
    {
      label: 'Challenge Similar Hiragana',
      start: 60,
      end: 65,
      isChallenge: true
    },
    {
      label: 'Challenge Confusing Katakana',
      start: 65,
      end: 69,
      isChallenge: true
    }
  ];

  const nonChallengeIndices = kana
    .map((k, i) => ({ k, i }))
    .filter(({ k }) => !k.groupName.startsWith('challenge.'))
    .map(({ i }) => i);
  const allNonChallengeSelected =
    nonChallengeIndices.length > 0 &&
    nonChallengeIndices.every(i => selected.has(i));

  const full: string[] = [];
  const compact: string[] = [];

  const covered = new Set<number>();

  if (allNonChallengeSelected) {
    full.push('all kana');
    compact.push('all kana');

    nonChallengeIndices.forEach(i => covered.add(i));
  }

  // Check parent groups first (All Hiragana, All Katakana, All Challenge)
  parentGroupDefs.forEach(parentDef => {
    // Skip if already covered by "all kana" and not a challenge group
    if (allNonChallengeSelected && parentDef.label !== 'All Challenge') return;

    // Check if all indices in this parent group are already covered
    let allCovered = true;
    for (let i = parentDef.start; i < parentDef.end; i++) {
      if (!covered.has(i)) {
        allCovered = false;
        break;
      }
    }
    if (allCovered) return;

    // Check if all indices in this parent group are selected
    let allInRange = true;
    for (let i = parentDef.start; i < parentDef.end; i++) {
      if (!selected.has(i)) {
        allInRange = false;
        break;
      }
    }

    if (!allInRange) return;

    // All selected - add parent group label and mark as covered
    full.push(parentDef.label);
    compact.push(parentDef.label);
    for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
  });

  // Then check individual subgroups for partial selections
  subgroupDefs.forEach(def => {
    // Skip if covered by "all kana" or parent group
    let allCovered = true;
    for (let i = def.start; i < def.end; i++) {
      if (!covered.has(i)) {
        allCovered = false;
        break;
      }
    }
    if (allCovered) return;

    let allInRange = true;
    for (let i = def.start; i < def.end; i++) {
      if (!selected.has(i)) {
        allInRange = false;
        break;
      }
    }

    if (!allInRange) return;

    full.push(def.label);
    compact.push(def.label);
    for (let i = def.start; i < def.end; i++) covered.add(i);
  });

  const sortedSelected = [...kanaGroupIndices].sort((a, b) => a - b);
  sortedSelected.forEach(i => {
    if (covered.has(i)) return;

    const group = kana[i];
    if (!group) return;

    const firstKana = group.kana[0];
    const isChallenge = group.groupName.startsWith('challenge.');
    full.push(
      isChallenge ? `${firstKana}-group (challenge)` : `${firstKana}-group`
    );
    compact.push(firstKana);
  });

  return { kanaGroupNamesFull: full, kanaGroupNamesCompact: compact };
};
