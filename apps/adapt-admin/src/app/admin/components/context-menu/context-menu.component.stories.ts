import type { Meta, StoryObj } from '@storybook/angular';
import { ContextMenuComponent } from './context-menu.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ContextMenuComponent> = {
  component: ContextMenuComponent,
  title: 'ContextMenuComponent',
};
export default meta;
type Story = StoryObj<ContextMenuComponent>;

export const Primary: Story = {
  args: {
    show: false,
    menuPositionX: 0,
    menuPositionY: 0,
    contextMenuItems: [],
  },
};

export const Heading: Story = {
  args: {
    show: false,
    menuPositionX: 0,
    menuPositionY: 0,
    contextMenuItems: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/context-menu works!/gi)).toBeTruthy();
  },
};
