import type { Meta, StoryObj } from '@storybook/angular';
import { CreateDatasetComponent } from './create-dataset.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<CreateDatasetComponent> = {
  component: CreateDatasetComponent,
  title: 'CreateDatasetComponent',
};
export default meta;
type Story = StoryObj<CreateDatasetComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/create-dataset works!/gi)).toBeTruthy();
  },
};
