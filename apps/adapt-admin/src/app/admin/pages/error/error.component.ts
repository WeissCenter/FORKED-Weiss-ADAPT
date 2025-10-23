import { Component, computed, Input, signal } from '@angular/core';
import { PagesContentService } from '../../../auth/services/content/pages-content.service';
import { ActivatedRoute, Params } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'adapt-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  @Input() logo = 'assets/shared/svg/state-hero-logo.svg';
  @Input() logoAlt = 'ADAPT logo';

  queryParamsSignal = signal<Params>({});

  public $pageContent = computed(() => {
    const params = this.queryParamsSignal();
    let what = params['what'] || '404';
    const errorContent = this.page.getPageContentSignal('error');
    let section = errorContent()?.sections?.find(sect => sect?.name === what);
    if (!section) section = errorContent()?.sections?.find(sect => sect?.name === '404');
    return { actions: errorContent()!.actions, ...(section as any) };
  });

  constructor(public page: PagesContentService, public route: ActivatedRoute){
    this.route.queryParams.subscribe(params => {
      this.queryParamsSignal.set(params);
    });


  }



}


