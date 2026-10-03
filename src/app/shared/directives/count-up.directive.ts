import {
  Directive,
  ElementRef,
  afterNextRender,
  inject
} from '@angular/core';

/**
 * Animates an element's text from 0 up to its numeric content
 * the first time it scrolls into view. Only digits, commas,
 * dots and a leading minus are parsed; units (%, +, ₹...) are
 * preserved as-is.
 *
 * Usage:
 *   <b appCountUp>12,840</b>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective {

  private readonly element = inject(ElementRef<HTMLElement>);

  constructor() {

    afterNextRender(() => {

      const el = this.element.nativeElement;

      const raw = el.textContent?.trim() ?? '0';

      const match = raw.match(/-?\d[\d,.]*/);

      if (!match) {

        return;

      }

      const target = parseFloat(match[0].replace(/,/g, ''));

      if (!Number.isFinite(target)) {

        return;

      }

      // Non-numeric decorations: "₹50,000" -> prefix "₹", suffix ""
      const prefix = raw.slice(0, raw.indexOf(match[0]));
      const suffix = raw.slice(raw.indexOf(match[0]) + match[0].length);

      const commas = match[0].includes(',');
      const decimals = (match[0].split('.')[1] ?? '').length;

      const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });

      const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {

            return;

          }

          const duration = 1400;

          const start = performance.now();

          const tick = (now: number) => {

            const progress = Math.min((now - start) / duration, 1);

            // easeOutCubic for a satisfying finish
            const eased = 1 - Math.pow(1 - progress, 3);

            const value = target * eased;

            const parts = formatter.formatToParts(value);

            let digits = '';

            for (const part of parts) {

              if (part.type === 'integer' || part.type === 'fraction') {

                digits += part.value;

              } else if (part.type === 'group') {

                digits += commas ? ',' : '';

              }

            }

            el.textContent = `${prefix}${digits}${suffix}`;

            if (progress < 1) {

              requestAnimationFrame(tick);

            }

          };

          requestAnimationFrame(tick);

          observer.disconnect();

        });

      }, { threshold: 0.4 });

      observer.observe(el);

    });

  }

}
