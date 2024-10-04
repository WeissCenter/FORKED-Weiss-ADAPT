import {
  DataSetOperation,
  DataSetOperationArgument,
  IGlossaryTerm,
  TemplateContext,
  TemplateError,
  TemplateErrorCode,
  mapTypes,
  randstr,
} from '@adapt/types';
import { firstValueFrom } from 'rxjs';
import { AdaptDataService } from '../adapt-data.service';
import { formatNumber } from '@angular/common';
import {GlossaryService} from '@adapt/adapt-shared-component-lib'

export const context = async function (this: any, field: string, ...args: any[]) {
  return this[field];
};

export const glossary = function (this: any, key: string, field: 'label' | 'definition') {
  const glossary = this.glossaryService as GlossaryService;

  if (!glossary.hasTerm(key)) {
    return key;
  }

  return (glossary.getTerm(key) as IGlossaryTerm)[field] || key;
};

export const top_disabilities_percentages = async function (
  this: any,
  count: number,
  ...conditionFields: { field: string; value: any }[]
) {
  const { suppress }: any = this;

  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `top_disabilities_percentages_${count}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
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
        value: `${count}`,
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
        value: 'IDEADISABILITYTYPE',
      },

      {
        "field": "CategorySetCode",
        "type": "string",
        "value": "ST3"
      },
      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'StudentCount',
      },
      {
        "field": "CategorySetCode",
        "type": "string",
        "value": "TOT"
      },
      ...conditionFieldArguments,
    ],
  };

  const result = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    suppress
  );

  const topThreeDisabilities = result.operationResults.find((item) => item.id === id);
  const sum = result.operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  // if(suppress){
  return topThreeDisabilities?.value.reduce((accum: string, val: any, idx: number) => {
    const percentage =
      suppress && val['StudentCount'] <= 0
        ? 'Suppressed'
        : `${((val['StudentCount'] / totalStudents) * 100).toFixed(2)}%`;
    const label = glossary.bind(this)(val['IDEADISABILITYTYPE'], 'label');

    if (idx === 0) {
      return `${label} (${percentage})`;
    }

    return `${accum}, ${idx === topThreeDisabilities.value.length - 1 ? 'and' : ''} ${label} (${percentage})`;
  }, '');
  // }
};

export const bottom_disabilities_percentages = async function (
  this: any,
  count: number,
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `bottom_disabilities_percentages_${count}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
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
        value: `${count}`,
      },
      {
        field: 'order',
        type: 'string',
        array: true,
        value: ['StudentCount asc'],
      },
      {
        field: 'groupby',
        type: 'string',
        value: 'IDEADISABILITYTYPE',
      },

      {
        "field": "CategorySetCode",
        "type": "string",
        "value": "ST3"
      },
      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'StudentCount',
      },
      {
        "field": "CategorySetCode",
        "type": "string",
        "value": "TOT"
      },
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    this.suppress
  );

  const bottomThreeDisabilities = operationResults.find((item) => item.id === id);
  const sum = operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  // if(this.suppress && bottomThreeDisabilities?.value.some((val: any) => val["StudentCount"] <= 0)){
  //   throw new TemplateError('bottom_disabilities_percentages function contains one or more suppresed values', TemplateErrorCode.SUPPRESSION)
  // }

  return bottomThreeDisabilities?.value.reduce((accum: string, val: any, idx: number) => {
    const percentage =
      this.suppress && val['StudentCount'] <= 0
        ? 'Suppressed'
        : `${((val['StudentCount'] / totalStudents) * 100).toFixed(2)}%`;
    const label = glossary.bind(this)(val['IDEADISABILITYTYPE'], 'label');

    if (idx === 0) {
      return `${label} (${percentage})`;
    }

    return `${accum}, ${idx === bottomThreeDisabilities.value.length - 1 ? 'and' : ''} ${label} (${percentage})`;
  }, '');
};

export const disability_sum = async function (
  this: any,
  sumField: string,
  reportCode: { field: string; value: any },
  reportLevel: { field: string; value: any },
  ...conditionFields: { field: string; value: any }[]
) {
  const { appliedFilters, templateFilters }: TemplateContext = this;

  const dataService = this.dataService as AdaptDataService;

  let categoryTag = 'TOT';

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  for (const key of Object.keys(appliedFilters)) {
    if (!appliedFilters[key]) {
      continue;
    }

    if (key === 'disability' || key === 'sex') {
      categoryTag = templateFilters?.[key]?.tags?.['categoryTag'] ?? 'TOT';
      break;
    }
  }

  const sumID = `disability_sum_${sumField}_${reportCode.field}-${reportCode.value}_${reportLevel.field}-${reportLevel.value}-${categoryTag}-${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: sumID,
    function: 'SUM',
    arguments: [
      {
        field: sumField,
      },
      reportCode,
      reportLevel,
      { field: 'CategorySetCode', value: categoryTag },
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation],
    this.template.suppression,
    this.suppress
  );

  const sum = operationResults.find((item) => item.id === sumID);

  return formatNumber(sum?.value, 'en-US');
};

export const sum = async function (this: any, sumField: string, ...conditionFields: { field: string; value: any }[]) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const sumID = `sum_${sumField}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: sumID,
    function: 'SUM',
    arguments: [
      {
        field: sumField,
      },
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation],
    this.template.suppression,
    this.suppress
  );

  const sum = operationResults.find((item) => item.id === sumID);

  return formatNumber(sum?.value, 'en-US');
};

export const disability_percentage = async function (
  this: any,
  disabilityCode: string,
  reportLevel: DataSetOperationArgument,
  reportCode: DataSetOperationArgument,
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `disability_percentage_${disabilityCode}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        type: 'string',
        value: 'sum',
      },
      {
        field: 'columns',
        type: 'string',
        value: ['StudentCount'],
        array: true,
      },
      {
        field: 'selectColumns',
        type: 'string',
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
        value: 'IDEADISABILITYTYPE',
      },
      {
        field: 'IDEADISABILITYTYPE',
        type: 'string',
        value: disabilityCode,
      },
      reportCode,
      reportLevel,

      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'StudentCount',
      },
      reportCode,
      reportLevel,
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    this.suppress
  );

  const disability = operationResults.find((item) => item.id === id);
  const sum = operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  return `${(((disability?.value?.[0]?.['StudentCount'] ?? 0) / totalStudents) * 100).toFixed(2)}%`;
};

export const percentage = async function (
  this: any,
  countColumn: string,
  target: { field: string; value: any },
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `percentage_${countColumn}_${target.field}-${target.value}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        type: 'string',
        value: 'sum',
      },
      {
        field: 'columns',
        value: [countColumn],
        array: true,
      },
      {
        field: 'selectColumns',
        type: 'string',
        array: true,
        value: [target.field],
      },
      {
        field: 'limit',
        type: 'number',
      },
      {
        field: 'order',
        type: 'string',
        array: true,
        value: [`${countColumn} desc`],
      },
      {
        field: 'groupby',
        type: 'string',
        array: Array.isArray(target.field),
        value: target.field,
      },
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation],
    this.template.suppression,
    this.suppress
  );

  const result = operationResults.find((item) => item.id === id);

  const total = result?.value.reduce((accum: number, val: any) => accum + val[countColumn], 0);
  const percentageTarget = result?.value.find((val: any) => val[target.field] === target.value);

  return `${((percentageTarget[countColumn] / total) * 100).toFixed(2)}%`;
};

export const top_disabilities_percentages_edfacts = async function (
  this: any,
  count: number,
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `top_disabilities_percentages_edfacts_${count}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        value: 'sum',
      },
      {
        field: 'columns',
        value: ['student_count#13'],
        array: true,
      },
      {
        field: 'selectColumns',
        value: ['disability_category__idea_#8'],
        array: true,
      },
      {
        field: 'limit',
        type: 'number',
        value: `${count}`,
      },
      {
        field: 'order',
        type: 'string',
        array: true,
        value: ['student_count#13 desc'],
      },
      {
        field: 'groupby',
        type: 'string',
        value: 'disability_category__idea_#8',
      },

      // {
      //   "field": "CategorySetCode",
      //   "type": "string",
      //   "value": "ST3"
      // },
      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'student_count#13',
      },
      // {
      //   "field": "CategorySetCode",
      //   "type": "string",
      //   "value": "TOT"
      // },
      ...conditionFieldArguments,
    ],
  };

  const result = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    this.suppress
  );

  const topThreeDisabilities = result.operationResults.find((item) => item.id === id);
  const sum = result.operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  return topThreeDisabilities?.value.reduce(
    (accum: string, val: any, idx: number) =>
      idx === 0
        ? `${glossary.bind(this)(val['disability_category__idea_#8'], 'label')} (${(
            (val['student_count#13'] / totalStudents) *
            100
          ).toFixed(2)}%)`
        : `${accum}, ${glossary.bind(this)(val['disability_category__idea_#8'], 'label')} (${(
            (val['student_count#13'] / totalStudents) *
            100
          ).toFixed(2)}%)`,
    ''
  );
};

export const bottom_disabilities_percentages_edfacts = async function (
  this: any,
  count: number,
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `bottom_disabilities_percentages_edfacts_${count}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        value: 'sum',
      },
      {
        field: 'columns',
        value: ['student_count#13'],
        array: true,
      },
      {
        field: 'selectColumns',
        value: ['disability_category__idea_#8'],
        array: true,
      },
      {
        field: 'limit',
        type: 'number',
        value: `${count}`,
      },
      {
        field: 'order',
        type: 'string',
        array: true,
        value: ['student_count#13 asc'],
      },
      {
        field: 'groupby',
        type: 'string',
        value: 'disability_category__idea_#8',
      },

      // {
      //   "field": "CategorySetCode",
      //   "type": "string",
      //   "value": "ST3"
      // },
      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'student_count#13',
      },
      // {
      //   "field": "CategorySetCode",
      //   "type": "string",
      //   "value": "TOT"
      // },
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    this.suppress
  );

  const topThreeDisabilities = operationResults.find((item) => item.id === id);
  const sum = operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  return topThreeDisabilities?.value.reduce(
    (accum: string, val: any, idx: number) =>
      idx === 0
        ? `${glossary.bind(this)(val['disability_category__idea_#8'], 'label')} (${(
            (val['student_count#13'] / totalStudents) *
            100
          ).toFixed(2)}%)`
        : `${accum}, ${glossary.bind(this)(val['disability_category__idea_#8'], 'label')} (${(
            (val['student_count#13'] / totalStudents) *
            100
          ).toFixed(2)}%)`,
    ''
  );
};

export const disability_percentage_edfacts = async function (
  this: any,
  disabilityCode: string,
  reportLevel: DataSetOperationArgument,
  reportCode: DataSetOperationArgument,
  ...conditionFields: { field: string; value: any }[]
) {
  const dataService = this.dataService as AdaptDataService;

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');

  const id = `disability_percentage_edfacts_${disabilityCode}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        type: 'string',
        value: 'sum',
      },
      {
        field: 'columns',
        type: 'string',
        value: ['student_count#13'],
        array: true,
      },
      {
        field: 'selectColumns',
        type: 'string',
      },
      {
        field: 'limit',
        type: 'number',
      },
      {
        field: 'order',
        type: 'string',
        array: true,
        value: ['student_count#13 desc'],
      },
      {
        field: 'groupby',
        type: 'string',
        value: 'disability_category__idea_#8',
      },
      {
        field: 'disability_category__idea_#8',
        type: 'string',
        value: disabilityCode,
      },
      reportCode,
      reportLevel,

      ...conditionFieldArguments,
    ],
  };

  const sumOperation: DataSetOperation = {
    id: id + '_sum',
    function: 'SUM',
    arguments: [
      {
        field: 'student_count#13',
      },
      reportCode,
      reportLevel,
      ...conditionFieldArguments,
    ],
  };

  const { operationResults } = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation, sumOperation],
    this.template.suppression,
    this.suppress
  );

  const disability = operationResults.find((item) => item.id === id);
  const sum = operationResults.find((item) => item.id === id + '_sum');

  const totalStudents = sum?.value;

  return `${(((disability?.value?.[0]?.['student_count#13'] ?? 0) / totalStudents) * 100).toFixed(2)}%`;
};

export const max = async function (
  this: any,
  index: number,
  fields: DataSetOperationArgument,
  ...conditionFields: DataSetOperationArgument[]
) {
  const dataService = this.dataService as AdaptDataService;

  const selectColumns = [fields.value].flat();

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');
  const fieldsMapped = selectColumns.map((val) => `${fields.field}-${val}`).join('_');

  const id = `max_index-${index}_${fieldsMapped}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'GROUPBY',
    arguments: [
      {
        field: 'func',
        value: 'max',
      },
      {
        field: 'columns',
        value: ['value'],
        array: true,
      },
      {
        field: 'selectColumns',
        value: selectColumns,
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
        value: ['value desc'],
      },
      {
        field: 'groupby',
        type: 'string',
        array: true,
        value: selectColumns,
      },
      ...conditionFieldArguments,
    ],
  };

  //const { suppress}: any = this;

  const result = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation],
    this.template.suppression,
    false
  );

  const maxResult = result.operationResults.find((item) => item.id === id);

  const maxResultValue = maxResult!.value[index];

  return `${selectColumns.map((v) => maxResultValue[v]).join(' ')}`;
};

export const select = async function (
  this: any,
  field: string,
  limit: number,
  order: string,
  ...conditionFields: DataSetOperationArgument[]
) {
  const dataService = this.dataService as AdaptDataService;

  const selectColumns = [field].flat();

  const conditionFieldArguments: any[] = conditionFields.map((val) =>
    Object.assign(val, { type: mapTypes(val.value) })
  );

  const conditionFieldIDMapped = conditionFields.map((val) => `${val.field}-${val.value}`).join('_');
  const fieldsMapped = selectColumns.map((val) => `${val}`).join('_');

  const id = `select_${fieldsMapped}_${conditionFieldIDMapped}`;

  const operation: DataSetOperation = {
    id: id,
    function: 'SELECT',
    arguments: [
      {
        field: 'selectColumns',
        value: field,
      },
      {
        field: 'limit',
        type: 'number',
        value: `${limit}`,
      },
      {
        field: 'order',
        type: 'string',
        value: order,
      },
      ...conditionFieldArguments,
    ],
  };

  const result = await dataService.getDataFromDataViewPromise(
    this.dataViewID,
    this.fileSpec,
    [operation],
    this.template.suppression,
    false
  );

  const maxResult = result.operationResults.find((item) => item.id === id);

  const maxResultValue = maxResult!.value.shift();

  return maxResultValue[field];
};

export const BUILT_IN_FUNCTIONS = [
  { name: 'top_disabilities_percentages', func: top_disabilities_percentages },
  { name: 'bottom_disabilities_percentages', func: bottom_disabilities_percentages },
  { name: 'top_disabilities_percentages_edfacts', func: top_disabilities_percentages_edfacts },
  { name: 'bottom_disabilities_percentages_edfacts', func: bottom_disabilities_percentages_edfacts },
  { name: 'sum', func: sum },
  { name: 'disability_percentage', func: disability_percentage },
  { name: 'disability_percentage_edfacts', func: disability_percentage_edfacts },
  { name: 'percentage', func: percentage },
  { name: 'context', func: context },
  { name: 'disability_sum', func: disability_sum },
  { name: 'glossary', func: glossary },
  { name: 'max', func: max },
  { name: 'select', func: select },
];
