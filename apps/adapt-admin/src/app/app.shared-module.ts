// Setting up because inlinesvg component needs to be imported into multiple modules

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSvgComponent } from './components/inline-svg/inline-svg.component';

import { AemAccessibilityCenterModule} from "aem-accessibility-center";

@NgModule({
  declarations: [InlineSvgComponent],
  imports: [
    CommonModule, 
    AemAccessibilityCenterModule
  ],
  exports: [InlineSvgComponent, AemAccessibilityCenterModule],
})
export class SharedModule {}
