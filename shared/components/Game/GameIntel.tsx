'use client';
import { memo, useMemo } from 'react';
import { MousePointer } from 'lucide-react';
import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/lib/styles';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import { formatLevelsAsRanges } from '@/shared/lib/helperFunctions';
import { getKanaGroupNames } from '@/features/Kana/lib/kanaFormatting';

const GameIntel = memo(({ gameMode: _gameMode }: { gameMode: string }) => {
  void _gameMode;
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const trainingDojo = pathWithoutLocale.split('/')[1];

  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  const { kanaGroupNamesFull, kanaGroupNamesCompact } = useMemo(
    () => getKanaGroupNames(kanaGroupIndices),
    [kanaGroupIndices]
  );

  const { formattedSelectionFull, formattedSelectionCompact } = useMemo(() => {
    if (trainingDojo === 'kana') {
      return {
        formattedSelectionFull: kanaGroupNamesFull.join(', '),
        formattedSelectionCompact: kanaGroupNamesCompact.join(', ')
      };
    }

    const sets =
      trainingDojo === 'kanji' ? selectedKanjiSets : selectedVocabSets;
    if (sets.length === 0) {
      return {
        formattedSelectionFull: 'None',
        formattedSelectionCompact: 'None'
      };
    }

    const ranges = formatLevelsAsRanges(sets);
    const full = ranges
      .split(', ')
      .map(r => `${r.includes('-') ? 'Levels' : 'Level'} ${r}`)
      .join(', ');

    return {
      formattedSelectionFull: full,
      formattedSelectionCompact: ranges
    };
  }, [
    trainingDojo,
    kanaGroupNamesFull,
    kanaGroupNamesCompact,
    selectedKanjiSets,
    selectedVocabSets
  ]);

  const selectionLabel =
    trainingDojo === 'kana' ? 'Selected Groups:' : 'Selected Levels:';

  return (
    <div
      className={clsx(
        'flex flex-col',
        cardBorderStyles,
        'text-[var(--secondary-color)]'
      )}
    >
      <div
        className={clsx(
          'flex w-full flex-col gap-2 border-[var(--border-color)] p-4'
        )}
      >
        <span className='flex items-center gap-2'>
          <MousePointer size={20} className='text-[var(--main-color)]' />
          {selectionLabel}
        </span>
        {/* Compact form on small screens */}
        <span className='text-sm break-words text-[var(--main-color)] md:hidden'>
          {formattedSelectionCompact}
        </span>
        {/* Full form on medium+ screens */}
        <span className='hidden text-sm break-words text-[var(--main-color)] md:inline'>
          {formattedSelectionFull}
        </span>
      </div>
    </div>
  );
});

GameIntel.displayName = 'GameIntel';

export default GameIntel;
