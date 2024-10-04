import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { randomUUID } from 'crypto';
import { GlossaryService } from '../../services/glossary.service';
import * as XLSX from 'xlsx'
import { xlsx_delete_row } from '@adapt/types';
import { chartExplainTemplateParse } from '@adapt/types';

interface ChartDataItem {
  [key: string]: string | number;
}

@Component({
  selector: 'lib-adapt-data-rep-grouped',
  templateUrl: './data-rep-grouped.component.html',
  styleUrls: ['./data-rep-grouped.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DataRepGroupedComponent implements OnInit {
  @ViewChild('explainationRegion') explainationRegion!: ElementRef;
  @ViewChild('explanationSwitch') explanationSwitch!: ElementRef;
  @ViewChild('glossarySwitch') glossarySwitch!: ElementRef;
  @ViewChild('dataModal') dataModal!: ElementRef;
  @ViewChild('dataModalCloseBtn') dataModalCloseBtn!: ElementRef;
  @ViewChild('dataModalSwitch') dataModalSwitch!: ElementRef;
  @ViewChild('bars') barPanel!: ElementRef;
  @ViewChild('dataTable', {static: false}) dataTable!: ElementRef;

  @Input() total = 0;

  @Input() suppressed = true;
  @Input() noData = false;

  @Input() data: any[] = [];
  @Input() raw: any = {
    description: 'Overview representation of the data containing relevant insight with Number and Percentage %.',
    noDataDescription:
      "Unfortunately, there is no data to display for this section. This is due to how the Office of Special Education Programs (OSEP) requires the State's data to be organized.",
    title: 'All Races/Ethnicities',
    chart: {
      yAxisLabel: 'Child Count',
      xAxisLabel: 'IDEADISABILITYTYPE',
      dataRetrievalOperations: [
        {
          arguments: [
            {
              field: 'func',
              type: 'string',
              value: 'sum',
            },
            {
              field: 'columns',
              value: ['StudentCount'],
              array: true,
            },
            {
              field: 'selectColumns',
              value: ['IDEADISABILITYTYPE'],
              array: true,
            },
            {
              field: 'limit',
              type: 'number',
            },
            {
              field: 'order',
              type: 'string',
              array: true,
              value: ['StudentCount desc'],
            },
            {
              field: 'groupby',
              type: 'string',
              array: true,
              value: ['IDEADISABILITYTYPE'],
            },
            {
              field: 'ReportCode',
              type: 'string',
              value: 'c002',
            },
            {
              field: 'CategorySetCode',
              type: 'string',
              value: 'CSA',
            },
          ],
          id: 'childCountBarChart-CategorySetCode-CSA',
          function: 'GROUPBY',
        },
      ],
      filterOn: 'x',
      groupBy: 'IDEADISABILITYTYPE',
      filterBy: 'RACE',
      xAxisValue: 'IDEADISABILITYTYPE',
      yAxisValue: 'StudentCount',
      data: [
        {
          StudentCount: 3176,
          IDEADISABILITYTYPE: 'DB',
          RACE: 'WH7',
        },
        {
          StudentCount: 2485,
          IDEADISABILITYTYPE: 'AUT',
          RACE: 'WH7',
        },
        {
          StudentCount: 2236,
          IDEADISABILITYTYPE: 'MD',
          RACE: 'WH7',
        },
        {
          StudentCount: 2176,
          IDEADISABILITYTYPE: 'DB',
          RACE: 'HI7',
        },
        {
          StudentCount: 1485,
          IDEADISABILITYTYPE: 'AUT',
          RACE: 'HI7',
        },
        {
          StudentCount: 1236,
          IDEADISABILITYTYPE: 'MD',
          RACE: 'HI7',
        },
      ],
      total: 0,
    },
  };
  currentFilter = 'all';
  quickFilters: string[] = [] as string[];

  @Input() rawDataType = 'normal';

  @Input() id = crypto.randomUUID();

  @Input() filtered = false;
  @Input() filterClass: 'filtered' | 'suppressed' = 'filtered';

  useH1 = false;
  @Input() headingLvl: 1 | 2 | 3 | 4 = 2;
  headingLvl2: 2 | 3 | 4 | 5 = (this.headingLvl + 1) as 2 | 3 | 4 | 5;
  headingLvl3: 3 | 4 | 5 | 6 = (this.headingLvl2 + 1) as 3 | 4 | 5 | 6;

  groupedData: any[] = [];

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

  description = '';


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

  processData() {
    const { groupBy, filterBy, xAxisValue, yAxisValue } = this.raw.chart;
    // Group data for chart
    const sumValue = yAxisValue === groupBy ? xAxisValue : yAxisValue;
    // Massage data for chart view
    if (this.currentFilter === 'all') {
      // Determine which value to sum

      // Generate consolidated "all" view
      const consolidatedData = this.consolidateData(groupBy, sumValue);

      this.data = Object.values(consolidatedData);
    } else {
      this.data = this.raw.chart.data.filter((item: ChartDataItem) => item[filterBy] === this.currentFilter);
    }
    this.generateInsight(sumValue);

    // If data is an array of objects, check if it has the optional definition property
    // if (this.data.length && this.data[0].definition)
    //   this.showGlossaryBtn = true;

    // Generate plain language summary
    this.generatePlainLanguage();

    // Find largest value
    const largestValue = this.data.reduce((max, item) => Math.max(max, item[yAxisValue]), -Infinity);

    // Collect a list of the unique IDs for each definition for proper ARIA labeling
    const glossaryItemIds: string[] = [];

    // Calculate total
    this.total = this.data.reduce((acc, item) => acc + item[yAxisValue], 0);

    // Calculate percentages and flex amount based on largest value
    // Flex amount is determined by dividing the item's value by the largest value
    // In the visual representation, the largest value fills the full width of the chart
    // effectively setting itself as "100%"
    this.data = this.data.map((item, index) => {
      item.percentage ??= (item[yAxisValue] / this.total) * 100;
      item.largest = item[yAxisValue] === largestValue;
      item.flexAmount = item[yAxisValue] / largestValue;
      glossaryItemIds.push(this.id + 'series-item-definition-' + index);
      return item;
    });
    // Sort the array from largest to smallest
    this.data.sort((a, b) => b[yAxisValue] - a[yAxisValue]);
    this.glossaryIdsString = glossaryItemIds.join(' ');
  }

  private async generateInsight(sumValue: any) {
    const { groupBy, filterBy, xAxisValue, yAxisValue } = this.raw.chart;
    const parseRegex = /{{(.+?)}}/g;


    this.insight = this.raw.descriptionTemplate ? this.raw.descriptionTemplate.replaceAll(parseRegex, (match: string, code: string) => {

      if (code === 'total') {
        const total = this.raw.chart.data.filter((val: any) => this.currentFilter === 'all' || val[filterBy] === this.currentFilter).reduce((acc: any, item: any) => acc + item[sumValue], 0);
        return `${total}`;
      } else if (code === 'percentage') {

        const filteredTotal = this.raw.chart.data.filter((val: any) => this.currentFilter === 'all' || val[filterBy] === this.currentFilter).reduce((acc: any, item: any) => acc + item[sumValue], 0);
        const total = this.raw.chart.data.reduce((acc: any, item: any) => acc + item[sumValue], 0);


        return `${((filteredTotal / total)  * 100).toFixed(2)}%`;
      }else if (code === 'filter'){
        return this.currentFilter === 'all' ? this.raw.allMap : `${this.raw.prefix || ''} ${this.currentFilter}`
      }

      return '';

    }) : this.raw.subtitle ?? this.raw.description;


  }

  generatePlainLanguage() {
    // Slice the array to include only the top items as per plainLanguageMaxCount
    const topItems = this.data.slice(0, this.plainLanguageMaxCount);

   

    const consolidatedData = this.consolidateData(this.raw.chart.xAxisValue, this.raw.chart.yAxisValue);
    

    const items: any[] =  Object.values(consolidatedData);

 

    // Convert each item into a plain language string
    const plainLanguageItems = items.flatMap((item: any) => {
      // Convert the value to a percentage string with two decimal places
      const percentageResult = (
        (item[this.raw.chart.yAxisValue] / items.reduce((acc: any, cur: { [x: string]: any; }) => acc + cur[this.raw.chart.yAxisValue], 0)) *
        100
      );
      const percentage = isNaN(percentageResult) ? '0.00' : percentageResult.toFixed(2);

      // Format the string with the label and the percentage
      return `${this.glossary.getTermSafe(item[this.raw.chart.xAxisValue]).label} (${percentage}%)`;
    });



    const explainTemplate = this.raw?.explainTemplate as string;

    this.plainLanguage = chartExplainTemplateParse(explainTemplate, plainLanguageItems)
  }

  private consolidateData(groupBy: string, sumValue: string) {
    return this.raw.chart.data.reduce((acc: any, item: any) => {
      const key = item[groupBy];

      if (!acc[key]) {
        acc[key] = { ...item, [groupBy]: key, [sumValue]: 0 };
      }
      acc[key][sumValue] += item[sumValue];

      return acc;
    }, {} as Record<string, any>);
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

  applyQuickFilter(filter: string) {
    this.currentFilter = filter;
    if (filter !== 'all') this.header = filter;
    else this.header = this.raw.title ?? this.raw.name;
    this.processData();

  }

  ngOnInit(): void {
    if (this.raw) {
      this.header = this.raw.title ?? this.raw.name;

      // this.data = this.raw.chart.data;

      // sort by letters first (i.e "Birth to 1" before "1 to 2")
      this.quickFilters = Array.from(
        new Set(this.raw.chart.data.map((item: ChartDataItem) => item[this.raw.chart.filterBy])),
        (value) => String(value)
      ).sort((a, b) => Number(/^[0-9]/.test(a))  - Number(/^[0-9]/.test(b)) || a.localeCompare(b, undefined, { numeric: true }));

      // if (this.rawDataType === 'barChart')
      //   this.data = this.mapToLabelValueArray(this.raw.chart.data);
      // else this.data = this.mapToLabelValueArray(this.raw.data);
    }

    this.processData();
  }

  ngAfterViewInit(): void {
    this.setupTabbing();
  }

  public downloadData(what: 'csv' | 'xlsx'){
    const fileName = `${this.header}.${what}`
    const workbook = XLSX.utils.table_to_book(this.dataTable.nativeElement);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    xlsx_delete_row(worksheet, range.e.r)
   
    XLSX.writeFile(workbook, fileName, {bookType: what});
  }

  public isNoData() {
    return this.raw.chart.data?.length <= 0 || this.data.every((item) => item[this.raw.chart.yAxisValue] <= 0);
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
