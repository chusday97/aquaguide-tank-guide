import { useRef, type ComponentProps, type MouseEvent } from 'react';
import { SpeciesDetailDialog as BaseSpeciesDetailDialog } from './SpeciesDetailDialogBase';

type SpeciesDetailDialogProps = ComponentProps<typeof BaseSpeciesDetailDialog>;
type CalculatorIntent = 'footer' | 'explicit' | null;

const findCompatibilityDisclosure = () => {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(
    '[data-detail-kind="species"] button[data-disclosure-purpose="secondary_evidence"]',
  ));
  return buttons.find(button => /混养关系|Compatibility/i.test(button.textContent || '')) || null;
};

export function SpeciesDetailDialog(props: SpeciesDetailDialogProps) {
  const calculatorIntentRef = useRef<CalculatorIntent>(null);

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      calculatorIntentRef.current = null;
      return;
    }
    if (target.closest('[data-species-detail-compatibility-action="open-calculator"]')) {
      calculatorIntentRef.current = 'explicit';
      return;
    }
    calculatorIntentRef.current = target.closest('.modalFooter') ? 'footer' : null;
  };

  const handleGoCalculator = () => {
    const intent = calculatorIntentRef.current;
    calculatorIntentRef.current = null;

    // The footer CTA says “View risks & alternatives”. Keep that action in-context:
    // reveal the existing compatibility evidence instead of silently changing routes.
    if (intent === 'footer') {
      const disclosure = findCompatibilityDisclosure();
      if (!disclosure) return;
      if (disclosure.getAttribute('aria-expanded') !== 'true') disclosure.click();
      window.requestAnimationFrame(() => {
        disclosure.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        disclosure.focus({ preventScroll: true });
      });
      return;
    }

    // Dedicated calculator actions still preserve the original navigation contract.
    props.onGoCalculator?.();
  };

  return (
    <div style={{ display: 'contents' }} onClickCapture={handleClickCapture}>
      <BaseSpeciesDetailDialog {...props} onGoCalculator={handleGoCalculator} />
    </div>
  );
}
