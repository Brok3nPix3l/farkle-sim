import { type Component, For, createEffect, on, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Die, { DieState } from "./Die";

enum scoreGroupIds {
  LG_STRAIGHT = 10,
  THREE_PAIRS = 11,
}

enum scoreGroupStrings {
  one = "one",
  five = "five",
  triple = "triple",
  lgStraight = "1-2-3-4-5-6",
  threePairs = "three pairs",
}

const App: Component = () => {
  const [validSelection, setValidSelection] = createSignal(true);
  const [currentRollScore, setCurrentRollScore] = createSignal(0);
  const [currentTurnScore, setCurrentTurnScore] = createSignal(0);
  const [scoringString, setScoringString] = createSignal("");
  const [dice, setDice] = createStore<DieState[]>([
    {
      index: 0,
      face: 1,
      held: false,
      locked: false,
      selectable: false,
    },
    {
      index: 1,
      face: 2,
      held: false,
      locked: false,
      selectable: false,
    },
    {
      index: 2,
      face: 3,
      held: false,
      locked: false,
      selectable: false,
    },
    {
      index: 3,
      face: 4,
      held: false,
      locked: false,
      selectable: false,
    },
    {
      index: 4,
      face: 5,
      held: false,
      locked: false,
      selectable: false,
    },
    {
      index: 5,
      face: 6,
      held: false,
      locked: false,
      selectable: false,
    },
  ]);
  const resetSelectable = () => {
    setDice(
      (die) => die.selectable,
      "selectable",
      (selectable) => false
    );
  };
  const setScoringDiceAsSelectable = () => {
    set1AsSelectable();
    set5AsSelectable();
    const frequencyMap = createFrequencyMap(activeDice());
    setTripleAsSelectable(frequencyMap);
    setLgStraightAsSelectable(frequencyMap);
    set3PairsAsSeleactable(frequencyMap);
  };
  const set1AsSelectable = () =>
    setDice(
      (die) => die.face === 1 && !die.held,
      "selectable",
      (selectable) => true
    );
  const set5AsSelectable = () =>
    setDice(
      (die) => die.face === 5 && !die.held,
      "selectable",
      (selectable) => true
    );
  const createFrequencyMap = (dice) => {
    const frequencyMap = new Map<number, number>();
    dice.forEach((die) => {
      if (frequencyMap.has(die.face)) {
        frequencyMap.set(die.face, frequencyMap.get(die.face) + 1);
      } else {
        frequencyMap.set(die.face, 1);
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
          (die) => die.face === value,
          "selectable",
          (selectable) => true
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
  };
  const set3PairsAsSeleactable = (frequencyMap: Map<number, number>) => {
    if (frequencyMap.size !== 2 && frequencyMap.size !== 3) return;
    let good = true;
    frequencyMap.forEach((frequency) => {
      if (frequency !== 2 && frequency !== 4) good = false;
    });
    if (good) {
      setDice(
        (die) => frequencyMap.has(die.face),
        "selectable",
        (selectable) => true
      );
    }
  };
  const activeDice = () => dice.filter((die) => die.held === false);
  const storedDice = () => dice.filter((die) => die.held === true);
  const incrementValue = (index: number) => {
    setDice(
      (die) => die.index === index,
      "face",
      (face) => (face + 1) % 6 || 6
    );
  };
  const checkIfSelectionIsValid = () => {
    setDice(
      (die) => die.invalid,
      "invalid",
      (invalid) => undefined
    );
    setCurrentRollScore(0);
    setScoringString("");
    let selectedDice = dice.filter((die) => die.held && die.selectable);
    let repeat = false;
    do {
      repeat = false;
      //fixme terrible hack to prevent unintended bugs; refactor to remove all of the if else statements
      //todo encapsulate these validation functions and sort them by score; use same validation here and in setScoringDiceAsSelectable?
      const frequencyMap = createFrequencyMap(selectedDice);
      // check if lgStraight
      //todo breaks if using > 6 dice
      if (frequencyMap.size === 6) {
        selectedDice.splice(0);
        setCurrentRollScore((prev) => prev + 3000);
        setScoringString(
          (prev) => prev + (prev ? " + " : "") + scoreGroupStrings.lgStraight
        );
        repeat = true;
      } else if (
        selectedDice.length === 6 &&
        (frequencyMap.size === 2 || frequencyMap.size === 3) &&
        Array.from(frequencyMap.entries()).every(
          (entry) => entry[1] == 2 || entry[1] == 4
        )
      ) {
        // check if 3Pairs
        // if (frequencyMap.size === 2 || frequencyMap.size === 3) {
        //   let good = true;
        //   frequencyMap.forEach((frequency) => {
        //     if (frequency !== 2 && frequency !== 4) good = false;
        //   });
        // if (good) {
        selectedDice.splice(0);
        setCurrentRollScore((prev) => prev + 1500);
        setScoringString(
          (prev) => prev + (prev ? " + " : "") + scoreGroupStrings.threePairs
        );
        repeat = true;
        break;
        // }
        // }
      } else {
        // check if triple
        let tripleFace: number;
        frequencyMap.forEach((frequency, face) => {
          //todo refactor when implementing quads+
          if (frequency >= 3) {
            tripleFace = face;
          }
        });
        if (tripleFace) {
          for (let i = 0; i < 3; i++) {
            const indexOfATripleFace = selectedDice.findIndex(
              (die) => die.face === tripleFace
            );
            selectedDice.splice(indexOfATripleFace, 1);
          }
          setCurrentRollScore(
            (prev) => prev + (tripleFace === 1 ? 1000 : tripleFace * 100)
          ); //todo when implementing config, pull this value from a lookup
          setScoringString(
            (prev) =>
              prev +
              (prev ? " + " : "") +
              scoreGroupStrings.triple +
              " " +
              tripleFace
          );
          repeat = true;
        } else {
          // check if 1
          const indexOf1 = selectedDice.findIndex((die) => die.face === 1);
          if (indexOf1 !== -1) {
            selectedDice.splice(indexOf1, 1);
            setCurrentRollScore((prev) => prev + 100); //todo when implementing config, pull this value from a lookup
            setScoringString(
              (prev) => prev + (prev ? " + " : "") + scoreGroupStrings.one
            );
            repeat = true;
          }

          // check if 5
          const indexOf5 = selectedDice.findIndex((die) => die.face === 5);
          if (indexOf5 !== -1) {
            selectedDice.splice(indexOf5, 1);
            setCurrentRollScore((prev) => prev + 50); //todo when implementing config, pull this value from a lookup
            setScoringString(
              (prev) => prev + (prev ? " + " : "") + scoreGroupStrings.five
            );
            repeat = true;
          }
        }
      }
    } while (repeat && selectedDice.length > 0);
    const isValidSelection = selectedDice.length < 1;
    if (!isValidSelection) {
      setDice(
        (die) => selectedDice.map((die) => die.index).includes(die.index),
        "invalid",
        (invalid) => true
      );
    }
    setValidSelection(selectedDice.length < 1);
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
    setDice(
      (die) => die.index === index,
      "held",
      (held) => !held
    );
    checkIfSelectionIsValid();
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
    setValidSelection(false); //todo replace with checkIfSelectionIsValid? I don't think there's ever a scenario where rolling the dice is valid, but maybe with some config changes down the line?
    setCurrentTurnScore((prev) => prev + currentRollScore());
    setCurrentRollScore(0);
    setScoringString("");
    lockDice();
    setDice(
      (die) => !die.held,
      "face",
      (face) => Math.ceil(Math.random() * 6)
    );
    resetSelectable();
    setScoringDiceAsSelectable();
  };
  const resetDice = () => {
    setDice(
      (die) => die.locked,
      "locked",
      (locked) => false
    );
    setDice(
      (die) => die.held,
      "held",
      (held) => false
    );
  };
  return (
    <div class="flex flex-col h-[100svh] justify-center">
      {currentTurnScore() && (
        <p class="self-end text-xl mb-4 mr-4">
          Current Turn: {currentTurnScore()}
        </p>
      )}
      <p class="text-4xl text-green-700 text-center pb-10">Farkle Sim</p>
      {scoringString && (
        <p class="text-center uppercase text-2xl">{`${scoringString()}${
          currentRollScore() ? ` - ${currentRollScore()}` : ""
        }${activeDice().length ? "" : " Rollout!"}`}</p>
      )}
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
      {storedDice().length && (
        <hr class="border-dashed border-8 border-gray-700"></hr>
      )}
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

      {validSelection() ? (
        activeDice().length ? (
          <button class="w-full text-center text-2xl" onclick={rollDice}>
            Roll
          </button>
        ) : (
          <button
            class="text-center text-2xl"
            onclick={() => {
              resetDice();
              rollDice();
            }}
          >
            Roll again
          </button>
        )
      ) : dice.some((die) => die.selectable) ? (
        <p class="text-center text-2xl">Select or remove dice</p>
      ) : (
        <p class="text-center text-2xl">Farkle!</p>
      )}
    </div>
  );
};

export default App;
