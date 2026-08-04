import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CallList from "./CallList.vue";
import { CallListFighter, CallListFighterBuilder } from "./CallListFighter.ts";

const CallFighters: CallListFighter[] = [
  new CallListFighterBuilder().build(),
  new CallListFighterBuilder().build(),
  new CallListFighterBuilder().withPresent(false).build(),
  new CallListFighterBuilder().build(),
];

const meta = {
  title: "CallList/CallList",
  component: CallList,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    fighters: CallFighters,
  },
  render: (args) => ({
    components: { CallList },
    setup() {
      return { args };
    },
    template: `<CallList v-bind="args">{{ args.default }}</CallList>`,
  }),
} satisfies Meta<typeof CallList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
