import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ModalComponent> = {
  component: ModalComponent,
  title: 'ModalComponent',
};
export default meta;
type Story = StoryObj<ModalComponent>;

export const Primary: Story = {
  args: {
    ariaLabelledby: '',
    ariaDescribedby: '',
    large: false,
  },
};

export const Heading: Story = {
  args: {
    ariaLabelledby: '',
    ariaDescribedby: '',
    large: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/modal works!/gi)).toBeTruthy();
  },
};
