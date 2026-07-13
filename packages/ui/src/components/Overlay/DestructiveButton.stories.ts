import type { Meta, StoryObj } from "@storybook/vue3-vite";
import DestructiveButton from "./DestructiveButton.vue";

const meta = {
  title: "Overlay/DestructiveButton",
  component: DestructiveButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    size: "xs",
    disabled: false,
  },
  render: (args) => ({
    components: { DestructiveButton },
    setup() {
      return { args };
    },
    template: `<DestructiveButton v-bind="args" />`,
  }),
} satisfies Meta<typeof DestructiveButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllSizes: Story = {
  render: () => ({
    components: { DestructiveButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <DestructiveButton size="xs" />
        <DestructiveButton size="sm" />
        <DestructiveButton size="md" />
        <DestructiveButton size="lg" />
        <DestructiveButton size="xl" />
      </div>
    `,
  }),
};

export const OverlayExample: Story = {
  render: () => ({
    components: { DestructiveButton },
    template: `
      <div style="position: relative; display: inline-flex;">
        <span style="display: inline-flex; height: 2rem; width: 2rem; align-items: center; justify-content: center; border-radius: 9999px; font-weight: 600; border: 1px solid currentColor;">
          M
        </span>
        <DestructiveButton style="position: absolute; top: -4px; right: -4px;" />
      </div>
    `,
  }),
};
