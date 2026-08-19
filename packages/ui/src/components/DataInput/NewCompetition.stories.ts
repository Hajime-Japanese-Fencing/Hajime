import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import NewCompetition from "./NewCompetition.vue";
import type { NewCompetitionPayload } from "./new-competition-payload.interface.ts";

const meta = {
  title: "DataInput/NewCompetition",
  component: NewCompetition,
  tags: ["autodocs"],
  render: () => ({
    components: { NewCompetition },
    setup() {
      const created = ref<NewCompetitionPayload | null>(null);

      function onCreate(payload: NewCompetitionPayload) {
        created.value = payload;
      }

      return { created, onCreate };
    },
    template: `
      <div>
        <NewCompetition @create="onCreate" />
        <pre v-if="created" style="margin-top: 16px;">{{ JSON.stringify(created, null, 2) }}</pre>
      </div>
    `,
  }),
} satisfies Meta<typeof NewCompetition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
