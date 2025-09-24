import { IFilter, ISection, ITemplate, TemplateContext } from '@adapt/types';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reportCondition',
})
export class ReportConditionPipe implements PipeTransform {
  transform(
    section: ISection,
    filters: any,
    context?: TemplateContext,
    tabIndex?: number
  ): { section: ISection | null; noData: boolean; test?: string } {
    if (context?.fileSpec === 'all' && 'sortableCategories' in context.template) {
      // get list of clean filters (no nulls)
      const cleanedFilters = Object.keys(filters).filter((key) => {
        if (Array.isArray(filters[key])) return filters[key].length && filters[key].every((item: any) => item !== null);

        return filters[key] !== null;
      });

      // map list to data fields
      const temp = context.template as ITemplate;
      const mappedCodes = cleanedFilters.map((key: string) => (temp.filters[key] as IFilter<unknown>).field);

      // find the best overlap for all the sortable categories

      const sortableCategories = temp.sortableCategories;

      const sortableCategoriesKeys = Object.entries(sortableCategories!.categories);

      if (!sortableCategoriesKeys?.length || !mappedCodes?.length) {
        return { section, noData: false };
      }

      const anyOverlap = sortableCategoriesKeys.every(([key, spec]) => {
        return Object.entries(spec).some(([specKey, fields]: [string, string[]]) =>
          mappedCodes.every((code) => fields.includes(code))
        );
      });

      return { section, noData: !anyOverlap, test: 'test was placed here' };
    }

    if (!section['condition']) {
      return { section, noData: false };
    }

    const { operator } = section.condition;

    const conditions = section.condition.conditions;

    if (tabIndex) {
      // conditions = conditions.filter(cond => {
      //   const filter = filters[cond.parent] as IFilter<unknown>;
      //   return filter.condition?.pages?.includes(template.pages?.[this.reportTabIndex].id || '')
      // })
    }

    const func = operator === 'AND' ? 'every' : 'some';

    const result = conditions[func]((cond) => {
      const filter = filters[cond.filterCode];
      if (filter === null) {
        return false;
      }
      if (!filter) {
        return true;
      }

      return cond.value.findIndex((item) => item == filter) !== -1;
    });

    //combined

    return { section, noData: !result };
  }
}
