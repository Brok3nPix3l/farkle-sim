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
  const [helperText, setHelperText] = createSignal("");
  const [scoreboardModalRef, setScoreboardModalRef] = createSignal(null);
  const [currentRollScore, setCurrentRollScore] = createSignal(0);
  const [currentTurnScore, setCurrentTurnScore] = createSignal(0);
  const [currentOverallScore, setCurrentOverallScore] = createSignal(0);
  createEffect(() =>
    console.log(`Current overall score: ${currentOverallScore()}`)
  );
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
      //todo mark all dice with same value as selectable and then revoke the selectability based on held dice
      valuesWithTriples.forEach((value) => {
        const indicies = dice
          .filter((die) => die.face === value)
          .map((die) => die.index)
          .slice(0, 3);
        setDice(
          (die) => indicies.includes(die.index),
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
    let selectedDice = dice.filter((die) => die.held && die.selectable);
    if (selectedDice.length === 0) return setValidSelection(false);
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
    setCurrentRollScore(0);
    setScoringString("");
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
  const endTurn = () => {
    setValidSelection(true);
    setCurrentOverallScore(
      (prev) => prev + currentTurnScore() + currentRollScore()
    );
    setCurrentTurnScore(0);
    setCurrentRollScore(0);
    setScoringString("");
    resetSelectable();
    resetDice();
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
  const viewScoreboard = () => {
    scoreboardModalRef().showModal();
  };
  const hideScoreboard = () => {
    scoreboardModalRef().close();
  };
  createEffect(() => {
    if (!validSelection() && dice.some((die) => die.selectable))
      return setHelperText("Select or remove dice");
    if (validSelection() && scoringString() && !activeDice().length)
      return setHelperText("ROLLOUT!");
    if (!validSelection() && !dice.some((die) => die.selectable))
      return setHelperText("FARKLE!");
    return setHelperText("\u00A0");
  });
  return (
    <div class="flex flex-col h-[100svh] justify-between">
      <dialog
        class="backdrop:bg-black backdrop:opacity-50 rounded-md"
        ref={setScoreboardModalRef}
        onclick={(e) => {
          const dialogDimensions = scoreboardModalRef().getBoundingClientRect();
          if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
          ) {
            hideScoreboard();
          }
        }}
      >
        <h3 class="text-3xl">Scoreboard</h3>
        <p class="text-2xl pt-10 pb-10">
          Current Score: {currentOverallScore()}
        </p>
        <button
          onclick={hideScoreboard}
          class="p-4 text-center text-2xl border-4 border-gray-800 rounded-xl bg-gray-600 text-white"
        >
          Dismiss
        </button>
      </dialog>
      <div id="header">
        <div class="flex flex-row justify-between pt-2 px-2">
          <button onclick={viewScoreboard}>
            <svg
              fill="none"
              stroke-width="2"
              xmlns="http://www.w3.org/2000/svg"
              width="3em"
              height="3em"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="overflow: visible; --darkreader-inline-stroke: currentColor;"
              data-darkreader-inline-stroke=""
            >
              <path
                stroke="none"
                d="M0 0h24v24H0z"
                fill="none"
                data-darkreader-inline-stroke=""
                style="--darkreader-inline-stroke: none;"
              ></path>
              <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
              <path d="M12 5v2"></path>
              <path d="M12 10v1"></path>
              <path d="M12 14v1"></path>
              <path d="M12 18v1"></path>
              <path d="M7 3v2"></path>
              <path d="M17 3v2"></path>
              <path d="M15 10.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z"></path>
              <path d="M6 9h1.5a1.5 1.5 0 0 1 0 3h-.5h.5a1.5 1.5 0 0 1 0 3h-1.5"></path>
            </svg>
          </button>
          {currentTurnScore() + currentRollScore() ? (
            <p class=" self-center text-xl">
              Current Turn: {currentTurnScore() + currentRollScore()}
            </p>
          ) : (
            ""
          )}
        </div>
        {scoringString && (
          <p class="text-center uppercase text-2xl">{`${scoringString()}${
            currentRollScore() ? ` - ${currentRollScore()}` : ""
          }`}</p>
        )}
      </div>
      <div id="dice">
        <div class="flex flex-row justify-evenly w-full flex-wrap gap-5">
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
        <div class="flex flex-row justify-evenly w-full flex-wrap gap-5">
          {/* fixme this is getting ugly */}
          {/* {activeDice().find(
            (die) => die.index === 0 || die.index === 1 || die.index === 2
          ) ? (
            <> */}
          {activeDice().find((die) => die.index === 0) ? (
            <Die
              state={activeDice().find((die) => die.index === 0)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {activeDice().find((die) => die.index === 1) ? (
            <Die
              state={activeDice().find((die) => die.index === 1)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {activeDice().find((die) => die.index === 2) ? (
            <Die
              state={activeDice().find((die) => die.index === 2)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {/* </>
          ) : (
            ""
          )} */}
          {/* {activeDice().find(
            (die) => die.index === 3 || die.index === 4 || die.index === 5
          ) ? (
            <> */}
          {activeDice().find((die) => die.index === 3) ? (
            <Die
              state={activeDice().find((die) => die.index === 3)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {activeDice().find((die) => die.index === 4) ? (
            <Die
              state={activeDice().find((die) => die.index === 4)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {activeDice().find((die) => die.index === 5) ? (
            <Die
              state={activeDice().find((die) => die.index === 5)}
              incrementValue={incrementValue}
              toggleHeld={toggleHeld}
            />
          ) : (
            <div class={"lg:w-32 md:w-28 w-24"} draggable="false">
              &nbsp
            </div>
          )}
          {/* </>
          ) : (
            ""
          )
          } */}
        </div>
      </div>
      <div id="controls" class="flex flex-col">
        <p class="text-center text-2xl">{helperText()}</p>
        <button
          class="py-4 text-center text-2xl border-4 border-emerald-700 rounded-xl bg-emerald-500 disabled:brightness-50"
          onclick={() => {
            if (!activeDice().length) resetDice();
            rollDice();
          }}
          disabled={!validSelection()}
        >
          {activeDice().length ? "Roll" : "Roll again"}
        </button>
        <button
          class=" py-4 text-center text-2xl border-4 bg-amber-600 border-amber-800 rounded-xl disabled:brightness-50"
          onclick={() => {
            if (!validSelection() && !dice.some((die) => die.selectable)) {
              setCurrentTurnScore(0);
              setCurrentRollScore(0);
            }
            endTurn();
          }}
          disabled={
            !(
              (validSelection() &&
                (!!currentRollScore() || !!currentTurnScore())) ||
              (!validSelection() && !dice.some((die) => die.selectable))
            )
          }
        >
          {!validSelection() && !dice.some((die) => die.selectable)
            ? "End Turn"
            : "Bank"}
        </button>
      </div>
    </div>
  );
};

export default App;
