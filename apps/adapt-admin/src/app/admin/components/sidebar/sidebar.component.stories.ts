import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'SidebarComponent',
};
export default meta;
type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/sidebar works!/gi)).toBeTruthy();
  },
};
