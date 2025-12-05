import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[libAdaptEditable]',
  standalone: false,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableDirective), multi: true }],
})
export class EditableDirective implements AfterViewInit, OnChanges, ControlValueAccessor {
  private onChange = (val: string) => {};
  private onTouched = () => {};

  @Input('libAdaptEditable') enabled = true;

  @Input() ariaLabel = '';

  public id = crypto.randomUUID();

  public value?: string;

  public disabled = false;

  private inputElement?: HTMLInputElement;

  private oldElement?: HTMLElement;

  private get text() {
    return this.elementRef.nativeElement['textContent'];
  }

  private get html() {
    return this.elementRef.nativeElement['innerHTML'];
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  writeValue(obj: string): void {
    this.value = obj;

    if (this.inputElement) this.inputElement.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = (change) => {
      return fn(change);
    };
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private replaceNode(target: any, element: any) {

    const parent = this.renderer.parentNode(element);

    this.renderer.insertBefore(parent, target, element);

    this.renderer.removeChild(parent, element);
  }

  ngOnChanges(changes: SimpleChanges): void {

    const { enabled } = changes;

    if (enabled.isFirstChange()) return;

    if (enabled.currentValue) {
      this.setupInputs();
    } else {
      this.resetElements();
    }
  }

  private setupInputs() {
    const setClasses = () => {
      this.renderer.addClass(this.inputElement, 'usa-input');
      this.renderer.addClass(this.inputElement, 'radius-md');
      this.renderer.addClass(this.inputElement, 'border-base');
      this.renderer.addClass(this.inputElement, 'border-2px');
      this.renderer.addClass(this.inputElement, 'width-full');
      this.renderer.addClass(this.inputElement, 'maxw-full');
      this.renderer.setAttribute(this.inputElement, 'id', this.id);
    };



    const element = this.elementRef.nativeElement as HTMLHeadingElement;
    this.oldElement = element;
    const styles = window.getComputedStyle(element);

    const styleString = `font-size:${styles.getPropertyValue('font-size')};`;

    if (this.elementRef.nativeElement instanceof HTMLHeadingElement) {
      this.inputElement = this.renderer.createElement('input') as HTMLInputElement;
      this.renderer.setProperty(this.inputElement, 'disabled', this.disabled);
      this.renderer.setProperty(this.inputElement, 'value', element.innerText);
      this.renderer.setAttribute(this.inputElement, 'aria-label', this.ariaLabel);

      setClasses();

      this.renderer.setAttribute(this.inputElement, 'style', styleString);

      this.replaceNode(this.inputElement, element);

      this.inputElement!.addEventListener('input', (event) => this.onChange(this.inputElement?.value || ''));
      this.inputElement!.addEventListener('blur', (event) => this.onTouched());
    } else if (this.elementRef.nativeElement instanceof HTMLParagraphElement) {



      this.inputElement = this.renderer.createElement('textarea');
      this.renderer.setProperty(this.inputElement, 'disabled', this.disabled);
      this.renderer.setProperty(this.inputElement, 'value', element.innerText);
      this.renderer.setAttribute(this.inputElement, 'aria-label', this.ariaLabel);

      // Copy styles to new input
      this.renderer.setAttribute(this.inputElement, 'style', styleString);

      setClasses();

      this.replaceNode(this.inputElement, element);

      this.inputElement!.addEventListener('input', (event) => this.onChange(this.inputElement?.value || ''));
      this.inputElement!.addEventListener('blur', (event) => this.onTouched());
    }
  }

  private resetElements() {
    if (!this.oldElement) return;
    this.replaceNode(this.oldElement, this.inputElement);
  }

  ngAfterViewInit(): void {
    if (!this.enabled) {
      return;
    }

    this.setupInputs();
  }
}
