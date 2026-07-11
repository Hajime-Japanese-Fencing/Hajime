import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BackButton from "./BackButton.vue";

const meta = {
  title: "Actions/BackButton",
  component: BackButton,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: { control: "boolean" },
    default: { control: "text" },
  },
  args: {
    size: "sm",
    disabled: false,
    default: undefined,
  },
  render: (args) => ({
    components: { BackButton },
    setup() {
      return { args };
    },
    template: `
      <BackButton v-bind="args">
        <template v-if="args.default">{{ args.default }}</template>
      </BackButton>
    `,
  }),
} satisfies Meta<typeof BackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabel: Story = {
  args: { default: "Back to competitions" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const ContextExample: Story = {
  render: () => ({
    components: { BackButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <BackButton />
          <span style="font-size: 1.25rem; font-weight: bold;">Competition A — Pool 1</span>
        </div>
      </div>
    `,
  }),
};
