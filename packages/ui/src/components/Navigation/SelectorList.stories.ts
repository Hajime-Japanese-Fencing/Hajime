import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import SelectorList from "./SelectorList.vue";
import type { SelectorItem } from "./selector-item.interface.ts";

const poolItems: SelectorItem[] = [
  { id: "pool-1", label: "Pool A" },
  { id: "pool-2", label: "Pool B" },
  { id: "pool-3", label: "Pool C" },
  { id: "pool-4", label: "Pool D" },
];

const bracketPhaseItems: SelectorItem[] = [
  { id: "round-16", label: "Round of 32" },
  { id: "round-8", label: "Round of 16" },
  { id: "quarter", label: "Quarter-finals" },
  { id: "semi", label: "Semi-finals" },
  { id: "final", label: "Final" },
];

const meta = {
  title: "Navigation/SelectorList",
  component: SelectorList,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
  args: {
    items: poolItems,
    size: "md",
    modelValue: "pool-1",
  },
  render: (args) => ({
    components: { SelectorList },
    setup() {
      const selected = ref(args.modelValue);
      return { args, selected };
    },
    template: `<SelectorList v-bind="args" v-model="selected" style="width: 220px;" />`,
  }),
} satisfies Meta<typeof SelectorList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pools: Story = {
  args: { items: poolItems, modelValue: "pool-1" },
};

export const BracketPhases: Story = {
  args: { items: bracketPhaseItems, modelValue: "quarter" },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { id: "pool-1", label: "Pool 1" },
      { id: "pool-2", label: "Pool 2 (fermée)", disabled: true },
      { id: "pool-3", label: "Pool 3" },
    ],
    modelValue: "pool-1",
  },
};

export const Small: Story = {
  args: { items: bracketPhaseItems, modelValue: "semi", size: "sm" },
};
