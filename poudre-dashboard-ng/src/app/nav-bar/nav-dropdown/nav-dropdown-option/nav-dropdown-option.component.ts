import { Component, Input, AfterViewInit}  from '@angular/core';

@Component({
  selector: 'dropdown-option',
  styleUrls: ['../nav-dropdown.component.css'],
  templateUrl:'./nav-dropdown-option.component.html'
})
export class DropdownOptionComponent{
  @Input() data: any;

  constructor(){
    console.log('here')
  }

  ngAfterViewChecked(){
    console.log(this.data);
  }
}
