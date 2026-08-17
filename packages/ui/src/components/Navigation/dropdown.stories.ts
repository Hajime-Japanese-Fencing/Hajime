import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Dropdown from "./Dropdown.vue";
import { DropdownOption } from "./dropdown-option.interface.ts";

const title: string = "Menu dropdown";

const options: DropdownOption[] = [
  {
    label: "option 1",
    return: undefined,
  },
  {
    label: "option 2",
    return: undefined,
  },
  {
    label: "option 3",
    return: undefined,
  },
];

const meta = {
  title: "Dropdown Menu",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    title,
    options,
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
