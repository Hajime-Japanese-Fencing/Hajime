import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DangerButton from "./DangerButton.vue";

const meta = {
  title: "Actions/DangerButton",
  component: DangerButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    wide: { control: "boolean" },
    block: { control: "boolean" },
    default: { control: "text" },
  },
  args: {
    size: "sm",
    disabled: false,
    loading: false,
    wide: false,
    block: false,
    default: "Cancel fight",
  },
  render: (args) => ({
    components: { DangerButton },
    setup() {
      return { args };
    },
    template: `<DangerButton v-bind="args">{{ args.default }}</DangerButton>`,
  }),
} satisfies Meta<typeof DangerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, default: "Cancelling..." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Wide: Story = {
  args: { wide: true },
};

export const Forfeit: Story = {
  args: { default: "Forfeit" },
};
