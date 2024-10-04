import type { Meta, StoryObj } from '@storybook/angular';
import { QuickSummaryComponent } from './quick-summary.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<QuickSummaryComponent> = {
  component: QuickSummaryComponent,
  title: 'QuickSummaryComponent',
};
export default meta;
type Story = StoryObj<QuickSummaryComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/quick-summary works!/gi)).toBeTruthy();
  },
};
