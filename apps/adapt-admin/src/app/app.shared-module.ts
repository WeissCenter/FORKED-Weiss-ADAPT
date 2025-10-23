// Setting up because inlinesvg component needs to be imported into multiple modules

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WeissAccessibilityCenterModule } from 'weiss-accessibility-center';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from '@adapt-apps/adapt-admin/src/environments/environment';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WeissAccessibilityCenterModule,
    LoggerModule.forRoot({
      level: environment.logLevel,
      // THIS IS REQUIRED, to make "line-numbers" work in SourceMap Object definition (without evalSourceMap)
      enableSourceMaps: (environment.logLevel === NgxLoggerLevel.OFF ? false : true)
    })

  ],
  exports: [WeissAccessibilityCenterModule],
})
export class SharedModule {}
