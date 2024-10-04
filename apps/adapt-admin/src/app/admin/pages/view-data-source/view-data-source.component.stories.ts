import type { Meta, StoryObj } from '@storybook/angular';
import { ViewDataSourceComponent } from './view-data-source.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ViewDataSourceComponent> = {
  component: ViewDataSourceComponent,
  title: 'ViewDataSourceComponent',
};
export default meta;
type Story = StoryObj<ViewDataSourceComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/view-data-source works!/gi)).toBeTruthy();
  },
};
