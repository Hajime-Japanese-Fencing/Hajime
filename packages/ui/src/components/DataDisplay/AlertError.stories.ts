import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AlertError from "./AlertError.vue";

const meta = {
  title: "DataDisplay/AlertError",
  component: AlertError,
  tags: ["autodocs"],
  argTypes: {
    default: { control: "text" },
  },
  args: {
    default: "An error occurred. Please try again.",
  },
  render: (args) => ({
    components: { AlertError },
    setup() {
      return { args };
    },
    template: `<AlertError>{{ args.default }}</AlertError>`,
  }),
} satisfies Meta<typeof AlertError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NetworkError: Story = {
  args: {
    default: "Network error: unable to reach the server.",
  },
};

export const NotFound: Story = {
  args: {
    default: "Competition not found.",
  },
};

export const LongMessage: Story = {
  args: {
    default:
      "An unexpected error occurred while loading the fight list. Please refresh the page or contact support if the problem persists.",
  },
};
