import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-chip',
  template: `<button class="ui-chip" [class.active]="active" type="button">
    <ng-content />
  </button>`,
  styleUrls: ['./ui-chip.component.scss'],
})
export class UiChipComponent {
  @Input() active = false;
}
