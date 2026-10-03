import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input
} from '@angular/core';

/**
 * Reveals an element with a fade-up animation the first time it
 * scrolls into view. Safe for SSR/hydration: the hiding is only
 * applied client-side after the initial render.
 *
 * Usage:
 *   <div appScrollReveal [appScrollRevealDelay]="120">...</div>
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective {

  readonly revealDelay = input<string | number>(0, {
    alias: 'appScrollRevealDelay'
  });

  private readonly element = inject(ElementRef<HTMLElement>);

  constructor() {

    afterNextRender(() => {

      const el = this.element.nativeElement;

      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .7s ease, transform .7s ease';
      el.style.transitionDelay = `${this.revealDelay()}ms`;
      el.style.willChange = 'opacity, transform';

      const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) {

            return;

          }

          requestAnimationFrame(() => {

            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transitionDelay = '0ms';
            el.style.willChange = 'auto';

          });

          observer.disconnect();

        });

      }, { threshold: 0.15 });

      observer.observe(el);

    });

  }

}
