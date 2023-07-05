import { type Component, For } from "solid-js";
import { createStore } from "solid-js/store";
import Die from "./Die";

const App: Component = () => {
  const [dice, setDice] = createStore([
    { index: 0, value: 1 },
    { index: 1, value: 2 },
    { index: 2, value: 3 },
    { index: 3, value: 4 },
    { index: 4, value: 5 },
    { index: 5, value: 6 },
  ]);
  const incrementValue = (index: number) => {
    setDice(
      (die) => die.index === index,
      "value",
      (value) => (value + 1) % 6 || 6
    );
  };
  return (
    <>
      <p class="text-4xl text-green-700 text-center py-20">Farkle Sim</p>
      <div class="flex flex-row justify-evenly w-full">
        <For each={dice}>
          {(die) => {
            return <Die state={die} incrementValue={incrementValue} />;
          }}
        </For>
      </div>
      <button
        class="w-full self-center pt-10 text-2xl"
        onclick={() =>
          setDice({ from: 0, to: dice.length - 1 }, "value", (value) =>
            Math.ceil(Math.random() * 6)
          )
        }
      >
        Roll
      </button>
    </>
  );
};

export default App;
