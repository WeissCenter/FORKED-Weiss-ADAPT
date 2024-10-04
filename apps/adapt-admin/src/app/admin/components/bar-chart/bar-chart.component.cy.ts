import { BarChartComponent } from './bar-chart.component';

it('simple mount', () => {
  cy.mount('<adapt-bar-chart></adapt-bar-chart>', {
    declarations: [BarChartComponent],
    componentProperties: {},
  });
});
