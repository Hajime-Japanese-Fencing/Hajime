import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Dropdown from "./Dropdown.vue";
import type { DropdownOption } from "./dropdown-option.interface.ts";

const title: string = "Menu dropdown";

function testFunc() {}
const options: DropdownOption[] = [
  {
    label: "option 1",
    return: testFunc,
  },
  {
    label: "option 2",
    return: testFunc,
  },
  {
    label: "option 3",
    return: testFunc,
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
