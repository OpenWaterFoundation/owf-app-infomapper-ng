import { Component, Input }  from '@angular/core';

@Component({
  selector: 'nav-dropdown-link',
  styleUrls: ['../nav-dropdown.component.css'],
  templateUrl:'./nav-dropdown-link.component.html'
})
export class DropdownLinkComponent {
  @Input() data: any;
}
