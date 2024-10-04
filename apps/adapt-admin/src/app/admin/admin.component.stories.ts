import type { Meta, StoryObj } from '@storybook/angular';
import { AdminComponent } from './admin.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<AdminComponent> = {
  component: AdminComponent,
  title: 'AdminComponent',
};
export default meta;
type Story = StoryObj<AdminComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/admin works!/gi)).toBeTruthy();
  },
};
