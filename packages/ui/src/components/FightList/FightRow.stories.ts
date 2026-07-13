import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { FightStatus } from "@hajime/core";
import FightRow from "./FightRow.vue";
import IpponResult from "./IpponResult.vue";
import IpponAssignButtons from "./IpponAssignButtons.vue";
import IpponResultList from "./IpponResultList.vue";

const meta = {
  title: "Fight/FightRow",
  component: FightRow,
  tags: ["autodocs"],
  argTypes: {
    fightStatus: {
      control: "select",
      options: ["waiting", "in_progress", "finished"] satisfies FightStatus[],
    },
    active: { control: "boolean" },
    score: { control: "text" },
    leftFighter: { control: "text" },
    rightFighter: { control: "text" },
  },
  args: {
    fightStatus: FightStatus.Waiting,
    active: false,
    score: null,
    leftFighter: "Yamamoto Taro",
    rightFighter: "Tanaka Kenji",
  },
  decorators: [
    () => ({
      template: `
        <div class="bg-base-300">
          <table class="table table-zebra w-full">
            <tbody><story /></tbody>
          </table>
        </div>`,
    }),
  ],
} satisfies Meta<typeof FightRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  args: { fightStatus: FightStatus.Waiting },
};

export const InProgress: Story = {
  args: { fightStatus: FightStatus.InProgress },
};

export const Finished: Story = {
  args: { fightStatus: FightStatus.Finished, score: "M - K" },
};

export const ActiveWithSlots: Story = {
  args: {
    active: true,
    fightStatus: FightStatus.InProgress,
    score: "1 - 0",
  },
  render: (args) => ({
    components: { FightRow, IpponResult, IpponAssignButtons, IpponResultList },
    setup() {
      return { args, FightStatus };
    },
    template: `
      <FightRow v-bind="args">
        <template #left-assign>
          <IpponAssignButtons @click="() => {}" />
        </template>
        <template #left-score>
          <IpponResultList :ippons="['M']" :removable="true" @remove="() => {}" />
        </template>
        <template #left-hansoku />
        <template #right-assign>
          <IpponAssignButtons @click="() => {}" />
        </template>
        <template #right-score>
          <IpponResultList :ippons="[]" :removable="true" @remove="() => {}" />
        </template>
        <template #right-hansoku />
        <template #actions-active>
          <button class="btn btn-outline btn-sm btn-success">Validate</button>
        </template>
        <template #actions-inactive />
      </FightRow>`,
  }),
};
