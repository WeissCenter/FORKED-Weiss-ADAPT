export function CreateBackendResponse<T>(statusCode: number, data?: T) {
  return {
    statusCode,
    body: JSON.stringify({ success: true, data }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
  };
}

export function createUpdateItemFromObject(obj: any, ignoreFields: string[] = []) {
  const keys = Object.keys(obj).filter((key) => !ignoreFields.includes(key));

  const UpdateExpression = keys.reduce(
    (accum, key, idx) => (idx === 0 ? `${accum} #${key} = :${key}` : `${accum}, #${key} = :${key}`),
    'SET '
  );

  const ExpressionAttributeNames = keys.reduce((accum, key) => Object.assign(accum, { [`#${key}`]: key }), {});

  const ExpressionAttributeValues = keys.reduce((accum, key) => Object.assign(accum, { [`:${key}`]: obj[key] }), {});

  return { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues };
}

export function CreateBackendErrorResponse(statusCode: number, err: any) {
  return {
    statusCode,
    body: JSON.stringify({ success: false, err }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
  };
}

export function getUserDataFromEvent(event: any) {
  let username = 'UNKNOWN';
  let givenName = 'UNKNOWN';
  let familyName = 'UNKNOWN';
  let email = 'UNKNOWN';

  if (!event.requestContext.authorizer) {
    console.error('No authorizer found in event');
  } else {
    if (event.requestContext.authorizer?.claims) {
      // cognito authorizer
      username = event.requestContext.authorizer.claims['cognito:username'];
      givenName = event.requestContext.authorizer.claims['given_name'];
      familyName = event.requestContext.authorizer.claims['family_name'];
      email = event.requestContext.authorizer.claims['email'];
    } else {
      // custom authorizer
      username = event.requestContext.authorizer?.username || username;
      givenName = event.requestContext.authorizer?.givenName || givenName;
      familyName = event.requestContext.authorizer?.familyName || familyName;
      email = event.requestContext.authorizer?.email || email;
    }
  }

  return {
    username,
    givenName,
    familyName,
    fullName: `${givenName} ${familyName}`,
    email,
  };
}

export function jsonToParquetSchema(json: any) {
  const isInt = (n: number) => n % 1 === 0;

  return Object.entries(json).reduce((accum: any, [key, value]) => {
    switch (typeof value) {
      case 'string': {
        accum[key] = { type: 'UTF8', optional: true };
        break;
      }
      case 'number': {
        accum[key] = { type: isInt(value) ? 'INT32' : 'DOUBLE', optional: true };
        break;
      }
      case 'boolean': {
        accum[key] = { type: 'BOOLEAN', optional: true };
        break;
      }
      default: {
        accum[key] = { type: 'UTF8', optional: true };
        break;
      }
    }

    return accum;
  }, {});
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mapTypes(value: any) {
  switch (typeof value) {
    case 'object':
    case 'string': {
      return 'string';
    }
    case 'boolean': {
      return 'boolean';
    }
    case 'number': {
      return 'number';
    }
    default: {
      return 'string';
    }
  }
}

export function randstr(prefix: string) {
  return Math.random()
    .toString(36)
    .replace('0.', prefix || '');
}

export function getPercentage(arr: any[], item: any, field: string) {
  const total = arr.reduce((accum, item) => accum + item[field], 0);

  return ((item[field] / total) * 100).toFixed(2);
}

export function cleanDBFields(item: any) {
  delete item.id;
  delete item.type;
  return item;
}

export function hash(str: string) {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export function cleanObject(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]: any) => {
      const notNull = v != null;

      if (!notNull || typeof v === 'undefined') {
        return false;
      }

      if (typeof v === 'string') {
        return v.length > 0;
      }

      if (Array.isArray(v)) {
        return v.every((item) => item !== null);
      }

      return true;
    })
  );
}

export function clearOtherControls(form: any, changedField: string, value?: string) {
  Object.keys(form.controls).forEach((field) => {
    if (field !== changedField) {
      form.get(field)?.setValue(value, { emitEvent: false });
    }
  });
}

export function flattenObject(obj: any) {
  const flattened: any = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value));
    } else {
      flattened[key] = value;
    }
  });

  return flattened;
}

export function getField(path: string, obj: any, separator = '.') {
  const properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev?.[curr], obj);
}


export function handleDynamicVariables(code: string, sumValue: string, xAxisValue: string, data: any[], total: number, suppressed = false, suppressedText = 'Suppressed') {
  const dynamicSplit = code.split("-");

  if(dynamicSplit.length >= 2){
    const [variable, type] = dynamicSplit;

    const filtered = data.filter((val: any) => val[xAxisValue].toLowerCase() === variable.toLowerCase());

    const filteredTotal = filtered.reduce((acc: any, item: any) => acc + item[sumValue], 0) || 0;

    if (type === 'total') {
      if (filteredTotal === 0 && suppressed) {
        // return suppressedText;
        return '';
      }
      return filteredTotal;
    } else if (type === 'percentage') {
      const percentage = (filteredTotal / total) * 100 || 0;
      if (suppressed && total === 0) {
        return suppressedText;
      }
      return total == 0 ? `0%` : `${percentage.toFixed(2)}%`;
    }

  }

  return '';
}


export function chartExplainTemplateParse(xAxisValue: string, total: number, sumValue: string, data: any[], explainTemplate?: string, plainLanguageItems: string[] = [], suppressed = false, suppressedText = 'Suppressed') {
  if (explainTemplate) {
    const select = ['first', 'second', 'third'];

    const parseRegex = /{{(.+?)}}/g;

    return explainTemplate.replaceAll(parseRegex, (match, code) => {
      const idx = select.indexOf(code);

      if (idx === -1) {

         return handleDynamicVariables(code, sumValue, xAxisValue, data, total, suppressed, suppressedText) || 'no data found';
 

      }

      return plainLanguageItems[idx];
    });
  }

  // Combine the items into a sentence
  let summary = 'In the reported data, ';
  if (plainLanguageItems.length > 2) {
    // Join all items with commas, but the last item with 'and'
    const allButLast = plainLanguageItems.slice(0, -1).join(', ');
    const lastItem = plainLanguageItems[plainLanguageItems.length - 1];
    summary += `${allButLast}, and ${lastItem}`;
  } else if (plainLanguageItems.length === 2) {
    // No comma, just 'and'
    summary += `${plainLanguageItems[0]} and ${plainLanguageItems[1]}`;
  } else if (plainLanguageItems.length === 1) {
    // If there's only one item, just add it
    summary += `${plainLanguageItems[0]}`;
  }

  // Finish the sentence if there are items
  if (plainLanguageItems.length > 0) {
    summary += ' represent the top categories.';
  } else {
    summary += 'No data available.';
  }

  return summary;
}



