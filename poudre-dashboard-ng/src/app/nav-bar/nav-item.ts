import { Type } from '@angular/core';

export class NavItem {
  constructor(public component: Type<any>, public data: any) {}
}
