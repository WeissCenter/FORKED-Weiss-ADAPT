import type { Meta, StoryObj } from '@storybook/angular';
import { ReportComponent } from './report.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ReportComponent> = {
  component: ReportComponent,
  title: 'ReportComponent',
};
export default meta;
type Story = StoryObj<ReportComponent>;

export const Primary: Story = {
  args: {
    preview: false,
  },
};

export const Heading: Story = {
  args: {
    preview: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/report works!/gi)).toBeTruthy();
  },
};
