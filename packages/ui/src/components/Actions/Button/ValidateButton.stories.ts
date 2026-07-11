import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ValidateButton from "./ValidateButton.vue";
import DangerButton from "./DangerButton.vue";

const meta = {
  title: "Actions/ValidateButton",
  component: ValidateButton,
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
    default: "Validate",
  },
  render: (args) => ({
    components: { ValidateButton },
    setup() {
      return { args };
    },
    template: `<ValidateButton v-bind="args">{{ args.default }}</ValidateButton>`,
  }),
} satisfies Meta<typeof ValidateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, default: "Validating..." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Wide: Story = {
  args: { wide: true },
};

export const ContextExample: Story = {
  render: () => ({
    components: { ValidateButton, DangerButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <ValidateButton>Validate fight</ValidateButton>
        <DangerButton>Cancel fight</DangerButton>
      </div>
    `,
  }),
};
