import { Component, Input }  from '@angular/core';

@Component({
  selector: 'dropdown-option',
  styleUrls: ['../nav-dropdown.component.css'],
  templateUrl:'./nav-dropdown-option.component.html'
})
export class DropdownOptionComponent {
  @Input() data: any;
}
