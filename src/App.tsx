import { type Component, For, createEffect, on } from "solid-js";
import { createStore } from "solid-js/store";
import Die from "./Die";

enum scoreGroupIds {
  LG_STRAIGHT = 10,
  THREE_PAIRS = 11,
}

const App: Component = () => {
  const [dice, setDice] = createStore([
    {
      index: 0,
      value: 1,
      held: false,
      locked: false,
      selectable: false,
      group: 0,
    },
    {
      index: 1,
      value: 2,
      held: false,
      locked: false,
      selectable: false,
      group: 1,
    },
    {
      index: 2,
      value: 3,
      held: false,
      locked: false,
      selectable: false,
      group: 2,
    },
    {
      index: 3,
      value: 4,
      held: false,
      locked: false,
      selectable: false,
      group: 3,
    },
    {
      index: 4,
      value: 5,
      held: false,
      locked: false,
      selectable: false,
      group: 4,
    },
    {
      index: 5,
      value: 6,
      held: false,
      locked: false,
      selectable: false,
      group: 5,
    },
  ]);
  const resetSelectable = () => {
    setDice(
      (die) => die.selectable,
      "selectable",
      (selectable) => false
    );
  };
  const resetGroups = () => {
    //todo refactor to only use active dice?
    dice.forEach((die) => {
      setGroup(die.index, die.index);
    });
  };
  const setGroup = (index: number, value: number) => {
    setDice(
      (die) => die.index === index,
      "group",
      (group) => value
    );
  };
  const setScoringDiceAsSelectable = () => {
    set1AsSelectable();
    set5AsSelectable();
    const frequencyMap = createFrequencyMap();
    setTripleAsSelectable(frequencyMap);
    setLgStraightAsSelectable(frequencyMap);
    set3PairsAsSeleactable(frequencyMap);
  };
  const set1AsSelectable = () =>
    setDice(
      (die) => die.value === 1 && !die.held,
      "selectable",
      (selectable) => true
    );
  const set5AsSelectable = () =>
    setDice(
      (die) => die.value === 5 && !die.held,
      "selectable",
      (selectable) => true
    );
  const createFrequencyMap = () => {
    const frequencyMap = new Map<number, number>();
    dice.forEach((die) => {
      if (die.held) return;
      if (frequencyMap.has(die.value)) {
        frequencyMap.set(die.value, frequencyMap.get(die.value) + 1);
      } else {
        frequencyMap.set(die.value, 1);
      }
    });
    return frequencyMap;
  };
  const setTripleAsSelectable = (frequencyMap: Map<number, number>) => {
    const valuesWithTriples = [];
    frequencyMap.forEach((value, key) => {
      //todo refactor when implementing quads+
      if (value >= 3) valuesWithTriples.push(key);
    });
    if (valuesWithTriples.length > 0) {
      valuesWithTriples.forEach((value) => {
        setDice(
          (die) => die.value === value,
          "selectable",
          (selectable) => true
        );
        setDice(
          (die) => die.value === value,
          "group",
          //todo uuid?
          (group) => value * 10
        );
      });
    }
  };
  const setLgStraightAsSelectable = (frequencyMap: Map<number, number>) => {
    //todo breaks if using > 6 dice
    if (frequencyMap.size !== 6) return;
    setDice(
      (die) => !die.held,
      "selectable",
      (selectable) => true
    );
    setDice(
      (die) => !die.held,
      "group",
      (group) => scoreGroupIds.LG_STRAIGHT
    );
  };
  const set3PairsAsSeleactable = (frequencyMap: Map<number, number>) => {
    if (frequencyMap.size !== 2 && frequencyMap.size !== 3) return;
    let good = true;
    frequencyMap.forEach((value, key) => {
      if (value !== 2 && value !== 4) good = false;
    });
    if (good) {
      setDice(
        (die) => frequencyMap.has(die.value),
        "selectable",
        (selectable) => true
      );
      setDice(
        (die) => frequencyMap.has(die.value),
        "group",
        (group) => scoreGroupIds.THREE_PAIRS
      );
    }
  };
  // createEffect(
  //   on(
  //     //todo figure out what this should actually be watching
  //     () => dice.filter((die) => die.value === 1),
  //     () => {
  //       resetSelectable();
  //       resetGroups();
  //       set1AsSelectable();
  //       set5AsSelectable();
  //       const frequencyMap = createFrequencyMap();
  //       setTripleAsSelectable(frequencyMap);
  //       setLgStraightAsSelectable(frequencyMap);
  //     }
  //   )
  // );
  const activeDice = () => dice.filter((die) => die.held === false);
  const storedDice = () => dice.filter((die) => die.held === true);
  const incrementValue = (index: number) => {
    setDice(
      (die) => die.index === index,
      "value",
      (value) => (value + 1) % 6 || 6
    );
  };
  const toggleHeld = (index: number) => {
    if (dice.find((die) => die.index === index).locked) {
      alert("Cannot toggle held on this locked die");
      return;
    }
    if (!dice.find((die) => die.index === index).selectable) {
      alert("Cannot toggle held on this unselectable die");
      return;
    }
    const targetGroup = dice.find((die) => die.index === index).group;
    console.log(`targetGroup: ${targetGroup}`);
    console.table(dice);
    setDice(
      (die) => die.group === targetGroup,
      "held",
      (held) => !held
    );
  };
  const lockDice = () => {
    setDice(
      (die) => die.held,
      "locked",
      (locked) => true
    );
    setDice(
      (die) => die.held,
      "selectable",
      (selectable) => false
    );
  };
  const rollDice = () => {
    lockDice();
    setDice(
      (die) => !die.held,
      "value",
      (value) => Math.ceil(Math.random() * 6)
    );
    resetSelectable();
    resetGroups();
    setScoringDiceAsSelectable();
  };
  return (
    <>
      <p class="text-4xl text-green-700 text-center py-20">Farkle Sim</p>
      <div class="flex flex-row justify-evenly w-full flex-wrap gap-5 pb-5">
        <For each={storedDice()}>
          {(die) => {
            return (
              <Die
                state={die}
                incrementValue={incrementValue}
                toggleHeld={toggleHeld}
              />
            );
          }}
        </For>
      </div>
      {storedDice().length && <hr class="border-dashed border-8"></hr>}
      <div class="flex flex-row justify-evenly w-full pt-5 pb-10 flex-wrap gap-5">
        <For each={activeDice()}>
          {(die) => {
            return (
              <Die
                state={die}
                incrementValue={incrementValue}
                toggleHeld={toggleHeld}
              />
            );
          }}
        </For>
      </div>

      <button class="w-full self-center text-2xl" onclick={rollDice}>
        Roll
      </button>
    </>
  );
};

export default App;
