import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Badge from "./Badge.vue";

const meta = {
  title: "DataDisplay/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "accent", "neutral", "success", "info", "warning", "error"],
    },
    variant: {
      control: "select",
      options: [undefined, "outline", "soft", "dash"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: ["squircle", "round"],
    },
    default: { control: "text" },
  },
  args: {
    color: "primary",
    size: "md",
    variant: undefined,
    default: "Badge",
  },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: `<Badge v-bind="args">{{ args.default }}</Badge>`,
  }),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { color: "primary", default: "Primary" },
};

export const Success: Story = {
  args: { color: "success", default: "Success" },
};

export const Error: Story = {
  args: { color: "error", default: "Error" },
};

export const Warning: Story = {
  args: { color: "warning", default: "Warning" },
};

export const Outline: Story = {
  args: { variant: "outline", default: "Outline" },
};

export const Soft: Story = {
  args: { variant: "soft", default: "Soft" },
};

export const AllColors: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Badge color="primary">Primary</Badge>
        <Badge color="secondary">Secondary</Badge>
        <Badge color="accent">Accent</Badge>
        <Badge color="neutral">Neutral</Badge>
        <Badge color="success">Success</Badge>
        <Badge color="info">Info</Badge>
        <Badge color="warning">Warning</Badge>
        <Badge color="error">Error</Badge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <Badge size="xs">XS</Badge>
        <Badge size="sm">SM</Badge>
        <Badge size="md">MD</Badge>
        <Badge size="lg">LG</Badge>
      </div>
    `,
  }),
};

export const AllShapes: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <Badge shape="squircle">Squircle</Badge>
        <Badge shape="round">Round</Badge>
      </div>
    `,
  }),
};
