import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RankingDetails from "./RankingDetails.vue";
import type { RankingDetail } from "./ranking-detail.interface.ts";

const fullRanking: RankingDetail[] = [
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
  title: "Pool/RankingDetails",
  component: RankingDetails,
  tags: ["autodocs"],
  args: {
    fighters: fullRanking,
  },
} satisfies Meta<typeof RankingDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoFighters: Story = {
  args: {
    fighters: [
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

export const SixFighters: Story = {
  args: {
    fighters: [
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

export const UnsortedInput: Story = {
  name: "Unsorted input (auto-sorted by rank)",
  args: {
    fighters: [
      {
        poolRank: 3,
        fighterName: "Suzuki Hiroshi",
        points: 3,
        nbVictories: 1,
        nbGivenIppons: 2,
        nbReceivedIppons: 3,
      },
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
    ],
  },
};
