import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "./Button.vue";

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["neutral", "primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
    variant: {
      control: "select",
      options: [undefined, "outline", "dash", "soft", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: "select",
      options: [undefined, "circle", "square"],
    },
    block: { control: "boolean" },
    wide: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    default: { control: "text" },
  },
  args: {
    color: "neutral",
    variant: "soft",
    size: "md",
    shape: undefined,
    block: false,
    wide: false,
    disabled: false,
    loading: false,
    default: "Button",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: `<Button v-bind="args">{{ args.default }}</Button>`,
  }),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, default: "Saving..." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Block: Story = {
  args: { block: true, default: "Full width" },
};

export const AllColors: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Button color="neutral" variant="soft">Neutral</Button>
        <Button color="primary" variant="soft">Primary</Button>
        <Button color="secondary" variant="soft">Secondary</Button>
        <Button color="accent" variant="soft">Accent</Button>
        <Button color="info" variant="soft">Info</Button>
        <Button color="success" variant="soft">Success</Button>
        <Button color="warning" variant="soft">Warning</Button>
        <Button color="error" variant="soft">Error</Button>
      </div>
    `,
  }),
};

export const AllStyles: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Button color="primary">Default (soft)</Button>
        <Button color="primary" variant="outline">Outline</Button>
        <Button color="primary" variant="dash">Dash</Button>
        <Button color="primary" variant="ghost">Ghost</Button>
        <Button color="primary" variant="link">Link</Button>
      </div>
    `,
  }),
};

export const ColorStyleCombined: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Button color="success" variant="soft">Success soft</Button>
        <Button color="success" variant="outline">Success outline</Button>
        <Button color="error" variant="soft">Error soft</Button>
        <Button color="error" variant="outline">Error outline</Button>
        <Button color="warning" variant="soft">Warning soft</Button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Button size="xs">XSmall</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">XLarge</Button>
      </div>
    `,
  }),
};
