import type { Meta, StoryObj } from '@storybook/angular';
import { DataSetsComponent } from './data-sets.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<DataSetsComponent> = {
  component: DataSetsComponent,
  title: 'DataSetsComponent',
};
export default meta;
type Story = StoryObj<DataSetsComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/data-sets works!/gi)).toBeTruthy();
  },
};
