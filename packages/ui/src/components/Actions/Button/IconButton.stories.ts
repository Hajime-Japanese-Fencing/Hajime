import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { Eye, Settings, Trash2, EyeOff, ArchiveRestore } from "lucide-vue-next";
import IconButton from "./IconButton.vue";

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
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
    tooltip: { control: "text" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: {
    color: "neutral",
    variant: "soft",
    size: "sm",
    tooltip: "Action",
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    components: { IconButton, Eye },
    setup() {
      return { args };
    },
    template: `
      <IconButton v-bind="args">
        <Eye :size="16" />
      </IconButton>
    `,
  }),
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: { tooltip: "View fight" },
};

export const WithoutTooltip: Story = {
  args: { tooltip: undefined },
};

export const Outline: Story = {
  args: { variant: "outline", tooltip: "Open" },
};

export const Disabled: Story = {
  args: { disabled: true, tooltip: "Locked" },
};

export const Loading: Story = {
  args: { loading: true, tooltip: "Loading..." },
};

export const AllSizes: Story = {
  render: () => ({
    components: { IconButton, Eye },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <IconButton size="xs" tooltip="xs"><Eye :size="12" /></IconButton>
        <IconButton size="sm" tooltip="sm"><Eye :size="14" /></IconButton>
        <IconButton size="md" tooltip="md"><Eye :size="16" /></IconButton>
        <IconButton size="lg" tooltip="lg"><Eye :size="20" /></IconButton>
        <IconButton size="xl" tooltip="xl"><Eye :size="24" /></IconButton>
      </div>
    `,
  }),
};

export const ContextExamples: Story = {
  render: () => ({
    components: { IconButton, Eye, EyeOff, ArchiveRestore, Settings, Trash2 },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <IconButton variant="outline" tooltip="Open fight"><ArchiveRestore :size="16" /></IconButton>
        <IconButton variant="outline" tooltip="Close fight"><EyeOff :size="16" /></IconButton>
        <IconButton variant="soft" color="error" tooltip="Delete"><Trash2 :size="16" /></IconButton>
        <IconButton variant="ghost" tooltip="Settings"><Settings :size="16" /></IconButton>
      </div>
    `,
  }),
};
