import { NgModule }                 from '@angular/core';

import { DragDropModule }           from '@angular/cdk/drag-drop';
import { ScrollingModule }          from '@angular/cdk/scrolling';

import { MatButtonModule }          from '@angular/material/button';
import { MatCheckboxModule }        from '@angular/material/checkbox';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatDividerModule }         from '@angular/material/divider';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatIconModule }            from '@angular/material/icon';
import { MatInputModule }           from '@angular/material/input';
import { MatListModule }            from '@angular/material/list';
import { MatMenuModule }            from '@angular/material/menu';
import { MatProgressBarModule }     from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule }          from '@angular/material/select';
import { MatSidenavModule }         from '@angular/material/sidenav';
import { MatSlideToggleModule }     from '@angular/material/slide-toggle';
import { MatTableModule }           from '@angular/material/table';
import { MatToolbarModule }         from '@angular/material/toolbar';
import { MatTooltipModule }         from '@angular/material/tooltip';

@NgModule({
  exports: [
    DragDropModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTableModule,
    ScrollingModule,
  ]
})
export class MaterialModule { }
  