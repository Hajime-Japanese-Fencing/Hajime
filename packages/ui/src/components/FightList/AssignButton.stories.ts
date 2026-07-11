import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AssignButton from "./AssignButton.vue";

const meta = {
  title: "Fight/AssignButton",
  component: AssignButton,
  tags: ["autodocs"],
  argTypes: {
    tooltip: { control: "text" },
    disabled: { control: "boolean" },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    default: { control: "text" },
  },
  args: {
    tooltip: "Men",
    disabled: false,
    size: "sm",
    default: "M",
  },
  render: (args) => ({
    components: { AssignButton },
    setup() {
      return { args };
    },
    template: `
      <AssignButton
        :tooltip="args.tooltip"
        :disabled="args.disabled"
        :size="args.size"
      >
        {{ args.default }}
      </AssignButton>
    `,
  }),
} satisfies Meta<typeof AssignButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Hansoku: Story = {
  args: {
    tooltip: "Hansoku",
    default: "Δ",
  },
};

export const AllButtons: Story = {
  render: () => ({
    components: { AssignButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <AssignButton tooltip="Men">M</AssignButton>
        <AssignButton tooltip="Kote">K</AssignButton>
        <AssignButton tooltip="Do">D</AssignButton>
        <AssignButton tooltip="Tsuki">T</AssignButton>
        <AssignButton tooltip="Hansoku">Δ</AssignButton>
      </div>
    `,
  }),
};
