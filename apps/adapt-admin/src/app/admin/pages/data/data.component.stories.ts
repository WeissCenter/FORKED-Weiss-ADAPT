import type { Meta, StoryObj } from '@storybook/angular';
import { DataComponent } from './data.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<DataComponent> = {
  component: DataComponent,
  title: 'DataComponent',
};
export default meta;
type Story = StoryObj<DataComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/data works!/gi)).toBeTruthy();
  },
};
