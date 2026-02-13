// steps-indicator.component.ts
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { StepsIndicatorStepComponent } from '../steps-indicator-step/steps-indicator-step.component';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'adapt-steps-indicator',
  standalone: false,
  templateUrl: './steps-indicator.component.html',
  styleUrls: ['./steps-indicator.component.scss'],
})
export class StepsIndicatorComponent implements AfterViewInit {
  @ContentChildren(StepsIndicatorStepComponent) steps!: QueryList<StepsIndicatorStepComponent>;

  @Input() step = 0;
  @Output() stepChange = new EventEmitter<number>();

  constructor(private logger: NGXLogger,
              private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.focusCurrentStepInput();
  }

  ngOnChanges() {
    this.focusCurrentStepInput();
  }

  private focusCurrentStepInput() {
    const currentStep = this.steps?.toArray()[this.step];
    if (currentStep) {
      currentStep.focusFirstInput();
    }
  }

  public getClass(index: number) {
    if (index === this.step) {
      return '--current';
    } else if (index < this.step) {
      return '--complete';
    }
    return '';
  }

  public getStepName(index?: number) {
    if (!this.steps) {
      return null;
    }
    if (index === undefined) {
      return this.steps.get(this.step)?.name;
    }
    if (index < 0 || index > this.steps.length) {
      return null;
    }
    return this.steps.get(index)?.name;
  }

  public setStep(index: number) {
    if (index < 0 || index > this.steps.length) {
      return;
    }
    this.step = index;
    this.stepChange.emit(this.step);
    this.focusCurrentStepInput();
  }

  public next() {
    this.logger.debug('Inside step-indicator next, step: ', this.step);
    if (this.step + 1 > this.steps.length - 1) {
      return;
    }
    this.step++;
    this.stepChange.emit(this.step);
    this.logger.debug('go next to step: ', this.step);
    this.focusCurrentStepInput();
  }

  public prev() {
    if (this.step - 1 < 0) {
      return;
    }
    this.step--;
    this.stepChange.emit(this.step);
    this.focusCurrentStepInput();
  }

  public get length() {
    return this.steps?.length ?? 0;
  }
}
