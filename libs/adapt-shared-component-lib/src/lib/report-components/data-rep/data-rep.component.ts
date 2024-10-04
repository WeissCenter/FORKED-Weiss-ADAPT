import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GlossaryService } from '../../services/glossary.service';

import { CommonModule } from '@angular/common';
import { GlossaryPipe } from '../../pipes';
import * as XLSX from 'xlsx'
import { xlsx_delete_row } from '@adapt/types';
import { chartExplainTemplateParse } from '@adapt/types';


@Component({
  selector: 'lib-adapt-data-rep',
  templateUrl: './data-rep.component.html',
  styleUrls: ['./data-rep.component.scss'],
})
export class DataRepComponent implements OnInit, OnChanges {
  @ViewChild('explainationRegion') explainationRegion!: ElementRef;
  @ViewChild('explanationSwitch') explanationSwitch!: ElementRef;
  @ViewChild('glossarySwitch') glossarySwitch!: ElementRef;
  @ViewChild('dataModal') dataModal!: ElementRef;
  @ViewChild('dataModalCloseBtn') dataModalCloseBtn!: ElementRef;
  @ViewChild('dataModalSwitch') dataModalSwitch!: ElementRef;
  @ViewChild('bars') barPanel!: ElementRef;
  @ViewChild('dataTable', {static: false}) dataTable!: ElementRef;

  @Input() total = 0;
  @Input() noDataItemCount = 0;
  @Input() noDataSummary = '';
  @Input() suppressed = false;
  @Input() noData = false;

  @Input() data: any[] = [];
  @Input() raw!: any;

  @Input() rawDataType = 'normal';

  @Input() id = crypto.randomUUID();

  @Input() filtered = false;
  @Input() filterClass: 'filtered' | 'suppressed' = 'filtered';

  useH1 = false;
  @Input() headingLvl: 1 | 2 | 3 | 4 = 2;
  headingLvl2: 2 | 3 | 4 | 5 = (this.headingLvl + 1) as 2 | 3 | 4 | 5;
  headingLvl3: 3 | 4 | 5 | 6 = (this.headingLvl2 + 1) as 3 | 4 | 5 | 6;

  @Input() header = 'Title';
  @Input() insight = 'Insight';
  plainLanguage = 'Plain Language';
  plainLanguageMaxCount = 5;
  showGlossary = false;
  showGlossaryBtn = false;
  glossaryIdsString = '';
  dataRepSettings = {
    showPlainLanguage: false,
    showGlossary: false,
  };

  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private focusableElementsString =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], li[tabindex="0"], li[tabindex="-1"], tr[tabindex="0"], tr[tabindex="-1"]';

  localization = 'en-US';

  constructor(private glossary: GlossaryService) {
    const saved = JSON.parse(localStorage.getItem('adapt-data-rep-settings') || '{}');
    if (saved.showPlainLanguage || saved.showGlossary) this.dataRepSettings = saved;
  }

  mapHeadingLvl(lvl: 1 | 2 | 3 | 4 | 5 | 6) {
    switch (lvl) {
      case 1:
        return 'h1';
      case 2:
        return 'h2';
      case 3:
        return 'h3';
      case 4:
        return 'h4';
      case 5:
        return 'h5';
      case 6:
        return 'h6';
    }
  }

  saveSettingsLocally() {
    localStorage.setItem(
      'adapt-data-rep-settings',
      JSON.stringify(
        this.dataRepSettings ?? {
          showPlainLanguage: false,
          showGlossary: false,
        }
      )
    );
  }

  // This function is used to convert an array of objects into an array of label/value objects for the dmeo on 11/13/23
  mapToLabelValueArray(array: any[]) {
    return array.map((item) => {
      let label = '';
      let value = 0;
      const definition = 'Pipe in definition here';

      Object.keys(item).forEach((key) => {
        if (typeof item[key] === 'string') {
          label = item[key];
        } else if (typeof item[key] === 'number') {
          value = item[key];
        }
      });

      return { label, value, definition };
    });
  }


  generatePlainLanguageForZeroTotalItems() {
    // Build a plain language sentence detailing which items have no data to show when suppression is off, but items still have no data
    // Get items with no data
    const noDataItems = this.data.filter((item) => item[this.raw.chart.yAxisValue] <= 0);
    this.noDataItemCount = noDataItems.length;
    // Get the plain language label for each item
    const plainLanguageItems = noDataItems.map(
      (item) => this.glossary.getTermSafe(item[this.raw.chart.xAxisValue]).label
    );
    if (plainLanguageItems.length > 2) {
      // Join all items with commas, but the last item with 'and'
      const allButLast = plainLanguageItems.slice(0, -1).join(', ');
      const lastItem = plainLanguageItems[plainLanguageItems.length - 1];
      this.noDataSummary += `${allButLast}, and ${lastItem}`;
    } else if (plainLanguageItems.length === 2) {
      // No comma, just 'and'
      this.noDataSummary += `${plainLanguageItems[0]} or ${plainLanguageItems[1]}`;
    } else if (plainLanguageItems.length === 1) {
      // If there's only one item, just add it
      this.noDataSummary += `${plainLanguageItems[0]}`;
    }
    this.noDataSummary += '.';
  }

  processData() {
    // If data is an array of objects, check if it has the optional definition property
    if (this.data.length && this.data[0].definition) this.showGlossaryBtn = true;

    // Generate plain language summary
    this.generatePlainLanguage();

    // Calculate total
    if (this.total <= 0 && this.raw.chart.total <= 0) {
      this.total = this.data.reduce((acc, item) => acc + item[this.raw.chart.yAxisValue], 0);
    } else if (this.total <= 0 && this.raw.chart.total > 0) {
      this.total = this.raw.chart.total;
    }

    // Find largest value
    const largestValue = this.data.reduce((max, item) => Math.max(max, item[this.raw.chart.yAxisValue]), -Infinity);

    // Collect a list of the unique IDs for each definition for proper ARIA labeling
    const glossaryItemIds: string[] = [];

    // Calculate percentages and flex amount based on largest value
    // Flex amount is determined by dividing the item's value by the largest value
    // In the visual representation, the largest value fills the full width of the chart
    // effectively setting itself as "100%"
    this.data = this.data.map((item, index) => {
      item.percentage ??= (item[this.raw.chart.yAxisValue] / this.total) * 100;
      item.largest = item[this.raw.chart.yAxisValue] === largestValue;
      item.flexAmount = item[this.raw.chart.yAxisValue] / largestValue;
      glossaryItemIds.push(this.id + 'series-item-definition-' + index);
      return item;
    });
    // Sort the array from largest to smallest
    this.data.sort((a, b) => b[this.raw.chart.yAxisValue] - a[this.raw.chart.yAxisValue]);
    this.glossaryIdsString = glossaryItemIds.join(' ');
    this.generatePlainLanguageForZeroTotalItems();
  }

  generatePlainLanguage() {
    // Slice the array to include only the top items as per plainLanguageMaxCount
    const topItems = this.data.slice(0, this.plainLanguageMaxCount);

    // Convert each item into a plain language string
    const plainLanguageItems = topItems.map((item) => {
      // Convert the value to a percentage string with two decimal places
      const percentageResult = (
        (item[this.raw.chart.yAxisValue] / this.data.reduce((acc, cur) => acc + cur[this.raw.chart.yAxisValue], 0)) *
        100
      );

      const percentage = isNaN(percentageResult) ? '0.00' : percentageResult.toFixed(2);

      // Format the string with the label and the percentage
      return `${this.glossary.getTermSafe(item[this.raw.chart.xAxisValue]).label} (${percentage}%)`;
    });

    const explainTemplate = this.raw?.explainTemplate as string;

    this.plainLanguage = chartExplainTemplateParse(explainTemplate, plainLanguageItems)
  }

  togglePlainLanguage() {
    this.dataRepSettings.showPlainLanguage = !this.dataRepSettings.showPlainLanguage;
    this.saveSettingsLocally();
    this.setupTabbing();
    // this.explanationSwitch.nativeElement.setAttribute('aria-pressed', this.dataRepSettings.showPlainLanguage);
    // this.explainationRegion.nativeElement.setAttribute('aria-expanded', this.dataRepSettings.showPlainLanguage);
  }

  setupTabbing() {
    if (this.dataRepSettings.showPlainLanguage) {
      this.explainationRegion?.nativeElement.addEventListener('keydown', this.handleTabFromPanel);
      this.explanationSwitch?.nativeElement.addEventListener('keydown', this.handleTabFromPlainLanguageBtn);
      this.glossarySwitch?.nativeElement.addEventListener('keydown', this.handleTabFromGlossaryBtn);
    } else {
      this.explanationSwitch?.nativeElement.focus();
      this.explainationRegion?.nativeElement.removeEventListener('keydown', this.handleTabFromPanel);
      this.explanationSwitch?.nativeElement.removeEventListener('keydown', this.handleTabFromPlainLanguageBtn);
      this.glossarySwitch?.nativeElement.removeEventListener('keydown', this.handleTabFromGlossaryBtn);
    }
  }

  handleTabFromPanel = (event: KeyboardEvent) => {
    // Handle forward tab (Tab without Shift)
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.glossarySwitch.nativeElement.focus();
    }
    // Handle backward tab (Shift + Tab)
    else if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.explanationSwitch.nativeElement.focus();
    }
  };

  handleTabFromPlainLanguageBtn = (event: KeyboardEvent) => {
    // Handle forward tab (Tab without Shift)
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      this.explainationRegion.nativeElement.focus();
    }
  };

  handleTabFromGlossaryBtn = (event: KeyboardEvent) => {
    // Handle backward tab (Shift + Tab)
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      this.explainationRegion.nativeElement.focus();
    }
  };

  toggleGlossary() {
    this.dataRepSettings.showGlossary = !this.dataRepSettings.showGlossary;
    this.saveSettingsLocally();
  }

  openDataModal() {
    this.dataModal.nativeElement.hidden = false;
    // const focusableElements = this.dataModal.nativeElement.querySelectorAll(
    //   this.focusableElementsString
    // ) as NodeListOf<HTMLElement>;
    // this.firstFocusableElement = focusableElements[0];
    // this.lastFocusableElement = focusableElements[focusableElements.length - 1];

    this.dataModalCloseBtn.nativeElement.focus();
    this.dataModal.nativeElement.addEventListener('keydown', this.trapTabKey);
  }

  trapTabKey = (event: KeyboardEvent) => {
    // const deepActiveElement = document.activeElement;

    if (event.key === 'Tab') {
      // if (event.shiftKey) {
      //   /* shift + tab */
      //   if (deepActiveElement === this.firstFocusableElement) {
      //     event.preventDefault();
      //     this.lastFocusableElement!.focus();
      //   }
      // } else {
      //   /* tab */
      //   if (deepActiveElement === this.lastFocusableElement) {
      //     event.preventDefault();
      //     this.firstFocusableElement!.focus();
      //   }
      // }
    } else if (event.key === 'Escape') {
      this.closeModal();
    }
  };

  closeModal() {
    this.dataModal.nativeElement.hidden = true;
    this.dataModal.nativeElement.removeEventListener('keydown', this.trapTabKey);
    this.dataModalSwitch.nativeElement.focus(); // Return focus to the element that opened the modal
  }

  ngOnInit(): void {
    if (this.raw) {
      this.header = this.raw.title ?? this.raw.name;
      this.insight = this.raw.subtitle ?? this.raw.description;
      this.data = this.raw.chart.data;

      // if (this.rawDataType === 'barChart')
      //   this.data = this.mapToLabelValueArray(this.raw.chart.data);
      // else this.data = this.mapToLabelValueArray(this.raw.data);
    }
    this.processData();
  }

  ngAfterViewInit(): void {
    this.setupTabbing();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.noData = this.raw.chart.data?.length <= 0;
  }

  public downloadData(what: 'csv' | 'xlsx'){
    const fileName = `${this.header}.${what}`
    const workbook = XLSX.utils.table_to_book(this.dataTable.nativeElement);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    xlsx_delete_row(worksheet, range.e.r)
   
    XLSX.writeFile(workbook, fileName, {bookType: what});
  }

  public get filterOrSuppress(){
   if (this.filtered && this.suppressed){
    return '(Suppressed, Filtered)'
  }
    else if(this.filtered){
      return '(Filtered)';
    }else if (this.suppressed){
      return '(Suppressed)'
    }
    return '';
  }
}
