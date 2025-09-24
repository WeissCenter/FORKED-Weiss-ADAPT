import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from '../app.shared-module';
import { LibModule } from '@adapt/adapt-shared-component-lib';
@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, LibModule, SharedModule],
  exports: [HeaderComponent],
})
export class ComponentsModule {}
