import type { Meta, StoryObj } from '@storybook/angular';
import { CreateReportComponent } from './create-report.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<CreateReportComponent> = {
  component: CreateReportComponent,
  title: 'CreateReportComponent',
};
export default meta;
type Story = StoryObj<CreateReportComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/create-report works!/gi)).toBeTruthy();
  },
};
