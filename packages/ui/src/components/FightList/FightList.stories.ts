import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { FightStatus } from "@hajime/core";
import type { Fight } from "./types.ts";
import FightList from "./FightList.vue";

const waitingFight: Fight = {
  id: 1,
  fighter1: { fighterId: 1, fighterName: "Yamamoto Taro", ipponsGiven: [], numberOfHansoku: 0 },
  fighter2: { fighterId: 2, fighterName: "Tanaka Kenji", ipponsGiven: [], numberOfHansoku: 0 },
  score: null,
  status: FightStatus.Waiting,
  scoreEvents: [],
  editable: false,
};

const inProgressFight: Fight = {
  id: 2,
  fighter1: { fighterId: 3, fighterName: "Suzuki Hiroshi", ipponsGiven: ["M"], numberOfHansoku: 0 },
  fighter2: { fighterId: 4, fighterName: "Nakamura Yuki", ipponsGiven: [], numberOfHansoku: 1 },
  score: "M",
  status: FightStatus.InProgress,
  scoreEvents: [{ id: 1, leftSide: true, type: "ippon", code: "M", firstBlood: true }],
  editable: true,
};

const finishedFight: Fight = {
  id: 3,
  fighter1: {
    fighterId: 5,
    fighterName: "Watanabe Ryu",
    ipponsGiven: ["K", "M"],
    numberOfHansoku: 0,
  },
  fighter2: { fighterId: 6, fighterName: "Ito Sakura", ipponsGiven: [], numberOfHansoku: 0 },
  score: "K - M",
  status: FightStatus.Finished,
  scoreEvents: [
    { id: 2, leftSide: true, type: "ippon", code: "K", firstBlood: true },
    { id: 3, leftSide: true, type: "ippon", code: "M", firstBlood: false },
  ],
  editable: false,
};

const allFights: Fight[] = [waitingFight, inProgressFight, finishedFight];

const meta = {
  title: "Fight/FightList",
  component: FightList,
  tags: ["autodocs"],
  argTypes: {
    activeFightId: { control: "number" },
  },
  args: {
    fights: allFights,
    activeFightId: null,
  },
} satisfies Meta<typeof FightList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStatuses: Story = {
  args: { activeFightId: null },
};

export const WithActiveFight: Story = {
  args: {
    activeFightId: 2,

    fights: [
      {
        id: 1,

        fighter1: {
          fighterId: 1,
          fighterName: "Yamamoto Taro",
          ipponsGiven: [],
          numberOfHansoku: 0,
        },

        fighter2: {
          fighterId: 2,
          fighterName: "Tanaka Kenji",
          ipponsGiven: [],
          numberOfHansoku: 0,
        },

        score: null,
        status: "waiting",
        scoreEvents: [],
        editable: false,
      },
      {
        id: 2,

        fighter1: {
          fighterId: 3,
          fighterName: "Suzuki Hiroshi",
          ipponsGiven: ["M"],
          numberOfHansoku: 0,
        },

        fighter2: {
          fighterId: 4,
          fighterName: "Nakamura Yuki",
          ipponsGiven: [],
          numberOfHansoku: 1,
        },

        score: "1 - 0",
        status: "in_progress",

        scoreEvents: [
          {
            id: 1,
            leftSide: true,
            type: "ippon",
            code: "M",
            firstBlood: true,
          },
        ],

        editable: true,
      },
      {
        id: 3,

        fighter1: {
          fighterId: 5,
          fighterName: "Watanabe Ryu",
          ipponsGiven: ["K", "M"],
          numberOfHansoku: 0,
        },

        fighter2: {
          fighterId: 6,
          fighterName: "Ito Sakura",
          ipponsGiven: [],
          numberOfHansoku: 0,
        },

        score: "K - M",
        status: "finished",

        scoreEvents: [
          {
            id: 2,
            leftSide: true,
            type: "ippon",
            code: "K",
            firstBlood: true,
          },
          {
            id: 3,
            leftSide: true,
            type: "ippon",
            code: "M",
            firstBlood: false,
          },
        ],

        editable: false,
      },
    ],
  },
};

export const SingleWaiting: Story = {
  args: { fights: [waitingFight], activeFightId: null },
};

export const AllFinished: Story = {
  args: {
    fights: [
      finishedFight,
      {
        ...finishedFight,
        id: 4,
        fighter1: { ...finishedFight.fighter1, fighterName: "Kato Hana" },
        fighter2: { ...finishedFight.fighter2, fighterName: "Ogawa Mio" },
      },
    ],
    activeFightId: null,
  },
};
