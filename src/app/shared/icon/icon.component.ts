import { Component, Input } from '@angular/core';
import { IconName } from './icon-name';

@Component({
  selector: 'app-icon',
  standalone: true,
  host: { class: 'app-icon' },
  template: `
    <svg class="icon-glyph" viewBox="0 0 24 24" focusable="false"
      [attr.role]="label ? 'img' : null"
      [attr.aria-label]="label || null"
      [attr.aria-hidden]="label ? null : 'true'">
      <use [attr.href]="'assets/icons/icons.svg#icon-' + name"></use>
    </svg>
  `
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() label = '';
}
