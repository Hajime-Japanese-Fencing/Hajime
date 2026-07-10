import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Modal from "./Modal.vue";

const meta = {
  title: "Actions/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    default: { control: "text" },
  },
  args: {
    title: "Modal title",
    default: "Modal body content goes here.",
  },
  render: (args) => ({
    components: { Modal },
    setup() {
      return { args };
    },
    template: `<Modal :title="args.title">{{ args.default }}</Modal>`,
  }),
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRichContent: Story = {
  args: {
    title: "Fighter details",
    default: "Yamamoto Taro — Pool A — Red",
  },
};
