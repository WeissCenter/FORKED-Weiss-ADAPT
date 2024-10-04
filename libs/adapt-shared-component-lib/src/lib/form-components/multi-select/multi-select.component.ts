/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'lib-adapt-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MultiSelectComponent,
    },
  ],
})
export class MultiSelectComponent implements ControlValueAccessor, OnInit, OnChanges {
  @ViewChildren(CheckboxComponent) checkboxes!: QueryList<CheckboxComponent>;

  @Input() readonly = false;
  @Input() selectID = '';
  @Input() label = '';
  @Input() hint = '';
  @Input() items: any[] = [];
  @Input() itemAccessor = 'value';
  @Input() itemLabel = 'name';
  @Input() compareID?: string;
  @Input() labelStyle?: { [clazz: string]: string };
  @Input() required?: boolean;

  @Output() applyFn = new EventEmitter<boolean>();

  @Input() originalItems: any[] = [];

  onChange = (value: any) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;
  showInput = true;
  public value: any;
  public _model: any[] = [];
  @Input() showOptions = false;
  public selectedIndex = -1;
  public filteredItems: any[] = [];
  private _exclusiveFields: string[] = [];
  hoveredItem: any = null;
  focusedItem: any = null;
  changeCount = 0;

  constructor(){
  }

  onApplyFn() {
    this.applyFn.emit(true);
    this.showOptions = false;
  }

  toggleExpand(): void {
    this.showOptions = !this.showOptions;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(obj: any): void {
    if (obj === null) return;
    this._model = Array.isArray(obj) ? [...obj] : [];
    this.updateChangeCount();
    this.updateCheckboxes();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  contains(value: any): boolean {
    if (this._model instanceof Array) {
      return this._model.indexOf(value) > -1;
    } else if (this._model) {
      return this._model === value;
    }
    return false;
  }

  addOrRemove(value: any) {
    if (value === null) return;
    if (this.contains(value)) {
      this.remove(value);
    } else {
      this.add(value);
    }
    this.updateChangeCount();
    this.updateCheckboxes();
  }

  onCheckboxChange(checked: boolean, value: any) {
    if (checked) {
      this.add(value);
    } else {
      this.remove(value);
    }
    this.updateChangeCount();
  }

  public add(value: any) {
    if (!this.contains(value)) {
      this._model.push(value);
      this.onChange(this._model);
    }
  }

  public remove(value: any) {
    const index = this._model.indexOf(value);
    if (index > -1) {
      this._model.splice(index, 1);
      this.onChange(this._model);
    }
  }

  set(value: any) {
    this._model = Array.isArray(value) ? [...value] : [];
    this.onChange(this._model);
    this.updateChangeCount();
  }

  get model() {
    return this._model;
  }

  onBlur(e: any) {
    if (!e.relatedTarget) {
      this.showOptions = false;
    }
  }

  onLastCheckBoxBlur(e: any) {
    if (!e.relatedTarget || e.relatedTarget?.getAttribute('type') !== 'checkbox') {
      this.showOptions = false;
      this.selectedIndex = -1;
    }
  }

  updateCheckboxes(): void {
    if (this.checkboxes) {
      this.checkboxes.forEach((checkbox) => {
        checkbox.checked = this._model.includes(checkbox.value);
      });
    }
  }

  onKeydown(e: KeyboardEvent) {
    const ignore = ['Shift', 'Tab'];

    if (!ignore.includes(e.key)) {
      this.showOptions = true;
    }

    if (e.key === 'ArrowUp' && this.selectedIndex > 0) {
      this.selectedIndex -= 1;
    } else if (e.key === 'ArrowDown' && this.selectedIndex < this.checkboxes.length) {
      this.selectedIndex += 1;
    }

    if (e.key.includes('Arrow')) {
      e.preventDefault();
      this.checkboxes.get(this.selectedIndex)?.focus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['originalItems']) {
      this.set(this.originalItems);
      this.showOptions = false;
      this.focusedItem = null;
    }
    this._model = this._model.filter((item) => item !== null);
  }

  updateChangeCount() {
    if (!this.originalItems) {
      return;
    }
    const originalSet = new Set(this.originalItems);
    const currentSet = new Set(this._model);

    const addedItems = this._model.filter((item: any) => !originalSet.has(item));
    const removedItems = this.originalItems.filter((item) => !currentSet.has(item));

    this.changeCount = addedItems.length + removedItems.length;
  }

  ngOnInit(): void {
    // Strip "all" and "none" from the item list
    this.items = this.items.filter(
      (item: any) => (item[this.itemAccessor] ?? item) !== 'all' && (item[this.itemAccessor] ?? item) !== 'none'
    );
    this.filteredItems = this.items;
    // Make a copy of the original selections
    if (this.originalItems) {
      this.originalItems = [...this.originalItems];
    } else {
      this.originalItems = [...this._model];
    }
    this._exclusiveFields = this.items
      .filter((item: any) => item.exclusive)
      .map((item: any) => item[this.itemAccessor]);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filteredItems = this.items.filter((item: any) =>
      item[this.itemLabel].toLowerCase().includes(value.toLowerCase())
    );
    this.selectedIndex = -1;
  }

  public clear() {
    this._model = [];
    this.onChange(this._model);
  }

  selectAll(checked: boolean): void {
    if (checked) {
      this._model = this.items.map((item) => (this.itemAccessor ? item[this.itemAccessor] : item));
    } else {
      this._model = [];
    }
    this.onChange(this._model);
    this.updateChangeCount();
  }

  selectOnly(value: string): void {
    this._model = [value];
    this.markAsTouched();
    this.onChange(this._model);
    this.updateChangeCount();
  }

  setHoveredItem(itemId: any | null): void {
    this.hoveredItem = itemId;
  }

  setFocusedItem(itemId: any | null): void {
    this.focusedItem = itemId;
  }

  isOnlyButtonVisible(itemId: any): boolean {
    return this.hoveredItem === itemId || this.focusedItem === itemId;
  }

  isSelected(value: any): boolean {
    return this._model.includes(value);
  }

  getSelectAllState(): boolean {
    return this.items.length > 0 && this._model.length === this.items.length;
  }

  isAllSelected(): boolean {
    return this.items.length > 0 && this._model.length === this.items.length;
  }

  onFocusIn(event: FocusEvent, item: string): void {
    const liElement = (event.target as HTMLElement).closest('li');
    if (liElement) {
      this.focusedItem = item;
    }
  }
}
