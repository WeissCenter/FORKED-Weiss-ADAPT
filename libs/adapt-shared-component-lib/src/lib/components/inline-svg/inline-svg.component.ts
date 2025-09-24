import { Component, OnInit, Input, HostListener } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InlineSvgService } from './inline-svg.service';

@Component({
  selector: 'lib-adapt-inline-svg',
  template:
    '<span role="img" [attr.aria-label]="!hidden && label ? label : \'\'" [innerHTML]="svgContent" [hidden]="hidden" [class]="svgClass"></span>',
  providers: [InlineSvgService],
})
export class InlineSvgComponent implements OnInit {
  @Input() alt = '';
  @Input() label?: string;
  @Input() src!: string;
  @Input() media?: string;
  @Input() svgClass = ''; // Optional class input

  hidden = true;
  svgContent: SafeHtml = '';
  randomId = ('img-desc' + Math.random().toString(36).substr(2, 9)) as string;

  constructor(
    private svgService: InlineSvgService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.alt && !this.label) this.label = this.alt;
    this.loadSvg();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.loadSvg();
  }

  private loadSvg(): void {
    if (this.media && !window.matchMedia(this.media).matches) {
      this.svgContent = '';
      this.hidden = true;
      return;
    }
    if (!this.src) {
      this.hidden = true;
      return;
    }
    this.svgService.getSvg(this.src).subscribe((svg) => {
      this.hidden = false;
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(
        svg + `<span id="${this.randomId}" class="visually-hidden">${this.label}</span>`
      );
    });
  }
}
