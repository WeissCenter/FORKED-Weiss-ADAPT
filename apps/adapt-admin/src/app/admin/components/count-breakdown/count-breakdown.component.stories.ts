import type { Meta, StoryObj } from '@storybook/angular';
import { CountBreakdownComponent } from './count-breakdown.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<CountBreakdownComponent> = {
  component: CountBreakdownComponent,
  title: 'CountBreakdownComponent',
};
export default meta;
type Story = StoryObj<CountBreakdownComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/count-breakdown works!/gi)).toBeTruthy();
  },
};
