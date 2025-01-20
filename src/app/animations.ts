import { animate, animateChild, group, query, style, transition, trigger } from "@angular/animations";

export const fadeInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 })),
      ]),
  ]);