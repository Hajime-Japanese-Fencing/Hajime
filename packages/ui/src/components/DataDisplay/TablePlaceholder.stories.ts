import type { Meta, StoryObj } from "@storybook/vue3-vite";
import TablePlaceholder from "./TablePlaceholder.vue";

const meta = {
  title: "DataDisplay/TablePlaceholder",
  component: TablePlaceholder,
  tags: ["autodocs"],
  argTypes: {
    rows: {
      control: { type: "number", min: 1, max: 20 },
    },
    columns: {
      control: { type: "number", min: 1, max: 10 },
    },
  },
  args: {
    rows: 5,
    columns: 4,
  },
} satisfies Meta<typeof TablePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewRows: Story = {
  args: {
    rows: 3,
    columns: 4,
  },
};

export const ManyRows: Story = {
  args: {
    rows: 10,
    columns: 4,
  },
};

export const TwoColumns: Story = {
  args: {
    rows: 5,
    columns: 2,
  },
};

export const WideTable: Story = {
  args: {
    rows: 5,
    columns: 8,
  },
};

export const SingleRow: Story = {
  args: {
    rows: 1,
    columns: 4,
  },
};
