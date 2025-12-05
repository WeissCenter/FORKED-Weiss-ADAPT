import { ViewportScroller } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { inPageNavigation } from '@uswds/uswds/js';
import { fromEvent, skip, Subscription, take, throttle, throttleTime } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
@Component({
  selector: 'adapt-in-page-navigation',
  standalone: false,
  templateUrl: './in-page-navigation.component.html',
  styleUrls: ['./in-page-navigation.component.scss'],
})
export class InPageNavigationComponent implements AfterViewInit {
  // @ViewChild('navigation') navigation!: ElementRef<HTMLDivElement>;

  @Input() headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h4';
  @Input() titleText = 'On this page';
  @Input() selector = 'main';
  @Input() headingElements = 'h3';
  @Input() sections: HTMLElement[] = [];
  @Input() interactWithParent = false;

  public links: { label: string; fragment: string }[] = [];

  public subscriptions: Subscription[] = [];

  private currentItem: HTMLElement | null = null;

  constructor(
    //private router: Router,
    //private route: ActivatedRoute,
    private logger: NGXLogger,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    // const fragSub = this.route.fragment.subscribe((id) => {
    //   const allLinks = this.navigation?.nativeElement.querySelectorAll(`a`);
    //   allLinks?.forEach(link => link.classList.remove("usa-current"))
    //   const anchor = this.navigation?.nativeElement
    //   .querySelector(`a[href="${window.location.pathname}#${id}"]`)
    //   anchor?.classList.add("usa-current");
    // })
    //   this.subscriptions.push(fragSub);
  }

  // public setActive(el: any)  {

  //   for(const intersection of el){

  //     const id = this.interactWithParent ? intersection.target?.parentElement.id : intersection.target.id;

  //     const anchor = this.navigation.nativeElement
  //     .querySelector(`a[href="${window.location.pathname}#${id}"]`)

  //     if (intersection.isIntersecting && !anchor?.classList.contains("usa-current")) {
  //       anchor?.classList.add(`usa-current`);
  //     }else if(anchor?.classList.contains("usa-current")){
  //       anchor?.classList.remove(`usa-current`);
  //     }

  //   }

  // };

  private setupClickListeners() {

    this.logger.debug('Inside setupClickListeners', this.elementRef);

      const navLinks = this.elementRef.nativeElement.querySelectorAll('.usa-in-page-nav__link');
      navLinks.forEach((link: HTMLAnchorElement) => {
        this.renderer.listen(link, 'click', (event: Event) => this.handleClick(event));
      });
  }

  private handleClick(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        this.scrollAndUpdateClass(targetElement, target);
      }
    }
  }

  private scrollAndUpdateClass(targetElement: HTMLElement, clickedItem: HTMLElement) {
    // Start the scroll
    const scrollPromise = targetElement.scrollIntoView({ behavior: 'instant' });

    // Use NgZone.runOutsideAngular to avoid triggering change detection
    this.ngZone.runOutsideAngular(() => {
      // Wait for scrolling to finish and then some extra time for USWDS to update
      Promise.resolve(scrollPromise).then(() => {
        setTimeout(() => {
          // Run the class update inside the Angular zone to ensure change detection
          this.ngZone.run(() => {
            this.updateCurrentItem(clickedItem);
          });
        }, 100); // Adjust this delay as needed
      });
    });
  }

  private updateCurrentItem(newItem: HTMLElement) {
    // Remove 'current-item' class from all items
    const allItems = this.elementRef.nativeElement.querySelectorAll('.usa-in-page-nav__link');
    allItems.forEach((item: HTMLElement) => {
      this.renderer.removeClass(item, 'usa-current');
    });

    // Add 'current-item' class to the new current item
    this.renderer.addClass(newItem, 'usa-current');

    // Update the currentItem reference
    this.currentItem = newItem;
  }

  // @HostListener("window:scroll")
  // public setActiveJS()  {

  //   if(!this.sections) return;

  //   const scrollY = window.scrollY  || document.documentElement.scrollTop || document.scrollingElement?.scrollTop ||  document.querySelector("html")?.scrollTop || document.querySelector("body")?.scrollTop || 0;

  //   this.sections.forEach((current) => {
  //     const sectionHeight = current.offsetHeight;

  //     const sectionTop = (current.getBoundingClientRect().top + window.scrollY) - 50;

  //     const id = this.interactWithParent ? current?.parentElement?.id : current.id;

  //     const anchor = this.navigation.nativeElement
  //     .querySelector(`a[href="${window.location.pathname}#${id}"]`)

  //     if (
  //       scrollY >= Math.trunc(sectionTop) &&
  //       scrollY <= sectionTop + sectionHeight
  //     ){
  //       anchor?.classList.add("usa-current");
  //     } else {
  //       anchor?.classList.remove("usa-current");
  //     }
  //   });

  // };

  ngAfterViewInit(): void {
    this.logger.debug('Inside ngAfterViewInit', this.elementRef);
    // document
    // .querySelector(this.selector)
    // ?.querySelectorAll(this.headingElements)
    // .forEach((heading) => {

    //   const id = heading.getAttribute("id") || heading.textContent?.toLowerCase()
    //   .replace(/[^a-z\d]/g, "-")
    //   .replace(/-{2,}/g, "-")
    //   .replace(/^-|-$/g, "");

    //   this.links.push({label: heading.textContent!, fragment: id!})

    // })

    inPageNavigation.init(this.elementRef.nativeElement);
    this.setupClickListeners();
  }

  // ngOnDestroy(): void {
  //     this.subscriptions.forEach(sub => sub.unsubscribe())
  // }
}
