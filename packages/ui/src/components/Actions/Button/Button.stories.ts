import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Button from "./Button.vue";

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "ghost", "outline"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    shape: {
      control: "select",
      options: [undefined, "circle", "square"],
    },
    disabled: { control: "boolean" },
    default: { control: "text" },
  },
  args: {
    variant: "primary",
    size: "md",
    disabled: false,
    shape: undefined,
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

export const Primary: Story = {
  args: { variant: "primary", default: "Primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary", default: "Secondary" },
};

export const Accent: Story = {
  args: { variant: "accent", default: "Accent" },
};

export const Ghost: Story = {
  args: { variant: "ghost", default: "Ghost" },
};

export const Outline: Story = {
  args: { variant: "outline", default: "Outline" },
};

export const Small: Story = {
  args: { size: "sm", default: "Small" },
};

export const Large: Story = {
  args: { size: "lg", default: "Large" },
};

export const Disabled: Story = {
  args: { disabled: true, default: "Disabled" },
};

export const Circle: Story = {
  args: { shape: "circle", default: "C" },
};

export const Square: Story = {
  args: { shape: "square", default: "S" },
};

export const AllVariants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
      </div>
    `,
  }),
};
