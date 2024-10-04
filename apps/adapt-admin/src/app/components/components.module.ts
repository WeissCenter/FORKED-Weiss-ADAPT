import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from '../app.shared-module';
import { InlineSvgComponent } from './inline-svg/inline-svg.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, SharedModule],
  exports: [HeaderComponent],
})
export class ComponentsModule {}
