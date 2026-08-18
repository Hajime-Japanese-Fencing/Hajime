import type { DropdownOption } from "@hajime/ui";
import type { PoolSetup } from "@hajime/core";
import type { PoolGroup } from "@hajime/core";

export function poolSetupToDropdownOption(setup: PoolSetup): DropdownOption {
  let label = "";
  setup.poolGroups.forEach((group: PoolGroup, index: number) => {
    label += `${index > 1 ? " &" : ""} ${group.amount} Pools of ${group.poolSize} Fighters`;
  });

  return {
    label: label + ` (${setup.fightCount} Fights)`,
    return: () => {
      return setup;
    },
  };
}
