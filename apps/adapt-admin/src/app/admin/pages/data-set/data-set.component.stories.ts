import type { Meta, StoryObj } from '@storybook/angular';
import { DataSetComponent } from './data-set.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<DataSetComponent> = {
  component: DataSetComponent,
  title: 'DataSetComponent',
};
export default meta;
type Story = StoryObj<DataSetComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/data-set works!/gi)).toBeTruthy();
  },
};
