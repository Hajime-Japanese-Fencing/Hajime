import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CloseButton from "./CloseButton.vue";

const meta = {
  title: "Actions/CloseButton",
  component: CloseButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    size: "sm",
    disabled: false,
  },
  render: (args) => ({
    components: { CloseButton },
    setup() {
      return { args };
    },
    template: `<CloseButton v-bind="args" />`,
  }),
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllSizes: Story = {
  render: () => ({
    components: { CloseButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <CloseButton size="xs" />
        <CloseButton size="sm" />
        <CloseButton size="md" />
        <CloseButton size="lg" />
        <CloseButton size="xl" />
      </div>
    `,
  }),
};

export const ContextExample: Story = {
  render: () => ({
    components: { CloseButton },
    template: `
      <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; width: 300px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: bold;">Fighter details</span>
          <CloseButton />
        </div>
        <p>Yamamoto Taro — Pool A — Red side</p>
      </div>
    `,
  }),
};
