import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripQuotes',
  standalone: false,
})
export class StripQuotesPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (typeof value !== 'string') return '';

    // Trim whitespace first
    const trimmed = value.trim();

    // Check for matching quotation marks around the string
    const match = trimmed.match(/^(['"])(.*)\1$/);
    return match ? match[2] : trimmed;
  }
}
