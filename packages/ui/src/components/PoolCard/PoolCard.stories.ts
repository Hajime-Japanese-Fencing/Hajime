import type { Meta, StoryObj } from "@storybook/vue3-vite";
import PoolCard from "./PoolCard.vue";
import type { PoolDetails } from "./pool-details.interface.ts";
import type { RankingDetail } from "../RankingDetails/ranking-detail.interface.ts";

const poolDetails: PoolDetails = {
  poolId: 1,
  fighters: [
    { fighterName: "Yamamoto Taro", poolRank: 1, number: 1 },
    { fighterName: "Tanaka Kenji", poolRank: 2, number: 2 },
    { fighterName: "Suzuki Hiroshi", poolRank: 3, number: 3 },
    { fighterName: "Nakamura Yuki", poolRank: 4, number: 4 },
  ],
};

const rankingDetails: RankingDetail[] = [
  {
    poolRank: 1,
    fighterName: "Yamamoto Taro",
    points: 9,
    nbVictories: 3,
    nbGivenIppons: 4,
    nbReceivedIppons: 1,
  },
  {
    poolRank: 2,
    fighterName: "Tanaka Kenji",
    points: 6,
    nbVictories: 2,
    nbGivenIppons: 3,
    nbReceivedIppons: 2,
  },
  {
    poolRank: 3,
    fighterName: "Suzuki Hiroshi",
    points: 3,
    nbVictories: 1,
    nbGivenIppons: 2,
    nbReceivedIppons: 3,
  },
  {
    poolRank: 4,
    fighterName: "Nakamura Yuki",
    points: 0,
    nbVictories: 0,
    nbGivenIppons: 1,
    nbReceivedIppons: 4,
  },
];

const meta = {
  title: "PoolCard/PoolCard",
  component: PoolCard,
  tags: ["autodocs"],
  args: {
    poolDetails,
    rankingDetails,
  },
} satisfies Meta<typeof PoolCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallPool: Story = {
  args: {
    poolDetails: {
      poolId: 2,
      fighters: [
        { fighterName: "Watanabe Ryu", poolRank: 1, number: 1 },
        { fighterName: "Ito Sakura", poolRank: 2, number: 2 },
      ],
    },
    rankingDetails: [
      {
        poolRank: 1,
        fighterName: "Watanabe Ryu",
        points: 3,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 0,
      },
      {
        poolRank: 2,
        fighterName: "Ito Sakura",
        points: 0,
        nbVictories: 0,
        nbGivenIppons: 0,
        nbReceivedIppons: 2,
      },
    ],
  },
};

export const LargePool: Story = {
  args: {
    poolDetails: {
      poolId: 3,
      fighters: [
        { fighterName: "Kato Hana", poolRank: 1, number: 1 },
        { fighterName: "Ogawa Mio", poolRank: 2, number: 2 },
        { fighterName: "Kimura Sota", poolRank: 3, number: 3 },
        { fighterName: "Matsumoto Ken", poolRank: 4, number: 4 },
        { fighterName: "Inoue Aya", poolRank: 5, number: 5 },
        { fighterName: "Kobayashi Jun", poolRank: 6, number: 6 },
      ],
    },
    rankingDetails: [
      {
        poolRank: 1,
        fighterName: "Kato Hana",
        points: 15,
        nbVictories: 5,
        nbGivenIppons: 7,
        nbReceivedIppons: 1,
      },
      {
        poolRank: 2,
        fighterName: "Ogawa Mio",
        points: 12,
        nbVictories: 4,
        nbGivenIppons: 5,
        nbReceivedIppons: 2,
      },
      {
        poolRank: 3,
        fighterName: "Kimura Sota",
        points: 9,
        nbVictories: 3,
        nbGivenIppons: 4,
        nbReceivedIppons: 3,
      },
      {
        poolRank: 4,
        fighterName: "Matsumoto Ken",
        points: 6,
        nbVictories: 2,
        nbGivenIppons: 3,
        nbReceivedIppons: 4,
      },
      {
        poolRank: 5,
        fighterName: "Inoue Aya",
        points: 3,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 5,
      },
      {
        poolRank: 6,
        fighterName: "Kobayashi Jun",
        points: 0,
        nbVictories: 0,
        nbGivenIppons: 0,
        nbReceivedIppons: 6,
      },
    ],
  },
};

export const MultipleCards: Story = {
  render: () => ({
    components: { PoolCard },
    setup() {
      const pools: Array<{ poolDetails: PoolDetails; rankingDetails: RankingDetail[] }> = [
        {
          poolDetails: {
            poolId: 1,
            fighters: [
              { fighterName: "Yamamoto Taro", poolRank: 1, number: 1 },
              { fighterName: "Tanaka Kenji", poolRank: 2, number: 2 },
              { fighterName: "Suzuki Hiroshi", poolRank: 3, number: 3 },
            ],
          },
          rankingDetails: [
            {
              poolRank: 1,
              fighterName: "Yamamoto Taro",
              points: 6,
              nbVictories: 2,
              nbGivenIppons: 3,
              nbReceivedIppons: 1,
            },
            {
              poolRank: 2,
              fighterName: "Tanaka Kenji",
              points: 3,
              nbVictories: 1,
              nbGivenIppons: 2,
              nbReceivedIppons: 2,
            },
            {
              poolRank: 3,
              fighterName: "Suzuki Hiroshi",
              points: 0,
              nbVictories: 0,
              nbGivenIppons: 1,
              nbReceivedIppons: 3,
            },
          ],
        },
        {
          poolDetails: {
            poolId: 2,
            fighters: [
              { fighterName: "Watanabe Ryu", poolRank: 1, number: 1 },
              { fighterName: "Ito Sakura", poolRank: 2, number: 2 },
              { fighterName: "Nakamura Yuki", poolRank: 3, number: 3 },
            ],
          },
          rankingDetails: [
            {
              poolRank: 1,
              fighterName: "Watanabe Ryu",
              points: 6,
              nbVictories: 2,
              nbGivenIppons: 4,
              nbReceivedIppons: 0,
            },
            {
              poolRank: 2,
              fighterName: "Ito Sakura",
              points: 3,
              nbVictories: 1,
              nbGivenIppons: 1,
              nbReceivedIppons: 2,
            },
            {
              poolRank: 3,
              fighterName: "Nakamura Yuki",
              points: 0,
              nbVictories: 0,
              nbGivenIppons: 0,
              nbReceivedIppons: 3,
            },
          ],
        },
      ];
      return { pools };
    },
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <PoolCard
          v-for="pool in pools"
          :key="pool.poolDetails.poolId"
          :pool-details="pool.poolDetails"
          :ranking-details="pool.rankingDetails"
        />
      </div>`,
  }),
};
