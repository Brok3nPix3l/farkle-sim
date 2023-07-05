import { type Component, For } from "solid-js";
import { createStore } from "solid-js/store";
import Die from "./Die";

const App: Component = () => {
  const [dice, setDice] = createStore([
    { index: 0, value: 1, held: false, locked: false, selectable: true },
    { index: 1, value: 2, held: false, locked: false, selectable: false },
    { index: 2, value: 3, held: false, locked: false, selectable: false },
    { index: 3, value: 4, held: false, locked: false, selectable: false },
    { index: 4, value: 5, held: false, locked: false, selectable: false },
    { index: 5, value: 6, held: false, locked: false, selectable: false },
  ]);
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
    setDice(
      (die) => die.index === index,
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
  };
  const rollDice = () => {
    lockDice();
    setDice(
      (die) => die.held !== true,
      "value",
      (value) => Math.ceil(Math.random() * 6)
    );
  };
  return (
    <>
      <p class="text-4xl text-green-700 text-center py-20">Farkle Sim</p>
      <div class="flex flex-row justify-evenly w-full">
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
      <div class="flex flex-row justify-evenly w-full mt-10">
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

      <button class="w-full self-center pt-10 text-2xl" onclick={rollDice}>
        Roll
      </button>
    </>
  );
};

export default App;
