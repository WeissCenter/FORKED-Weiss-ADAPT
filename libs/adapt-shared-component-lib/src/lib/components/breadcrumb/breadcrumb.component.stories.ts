import type { Meta, StoryObj } from '@storybook/angular';
import { BreadcrumbComponent } from './breadcrumb.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<BreadcrumbComponent> = {
  component: BreadcrumbComponent,
  title: 'BreadcrumbComponent',
};
export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/breadcrumb works!/gi)).toBeTruthy();
  },
};
