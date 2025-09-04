import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-card',
  template: `
    <article class="ui-card" [class.clickable]="clickable">
      <ng-content></ng-content>
    </article>
  `,
  styleUrls: ['./ui-card.component.scss'],
})
export class UiCardComponent {
  @Input() clickable = false;
}
