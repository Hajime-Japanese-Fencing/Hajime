import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IpponResult from "./IpponResult.vue";

const meta = {
  title: "FightList/IpponResult",
  component: IpponResult,
  tags: ["autodocs"],
  argTypes: {
    removable: { control: "boolean" },
    firstBlood: { control: "boolean" },
    default: { control: "text" },
  },
  args: {
    removable: false,
    firstBlood: false,
    default: "M",
  },
  render: (args) => ({
    components: { IpponResult },
    setup() {
      return { args };
    },
    template: `<IpponResult v-bind="args">{{ args.default }}</IpponResult>`,
  }),
} satisfies Meta<typeof IpponResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { default: "M" },
};

export const FirstBlood: Story = {
  args: { firstBlood: true, default: "K" },
};

export const Removable: Story = {
  args: { removable: true, default: "D" },
};

export const AllCodes: Story = {
  render: () => ({
    components: { IpponResult },
    template: `
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <IpponResult>M</IpponResult>
        <IpponResult>K</IpponResult>
        <IpponResult>D</IpponResult>
        <IpponResult>T</IpponResult>
        <IpponResult>Ht</IpponResult>
        <IpponResult :firstBlood="true">M</IpponResult>
        <IpponResult :removable="true">K</IpponResult>
      </div>`,
  }),
};
