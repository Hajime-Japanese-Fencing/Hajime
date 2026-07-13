import type { Meta, StoryObj } from "@storybook/vue3-vite";
import IpponAssignButtons from "./IpponAssignButtons.vue";

const meta = {
  title: "Fight/IpponAssignButtons",
  component: IpponAssignButtons,
  tags: ["autodocs"],
  render: () => ({
    components: { IpponAssignButtons },
    template: `<IpponAssignButtons @click="(code) => console.log('assign', code)" />`,
  }),
} satisfies Meta<typeof IpponAssignButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
