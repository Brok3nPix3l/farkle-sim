import type { Component } from "solid-js";
import Die from "./Die";

const App: Component = () => {
  return (
    <>
      <p class="text-4xl text-green-700 text-center py-20">Farkle Sim</p>
      <div class="flex flex-row justify-evenly w-full">
        {[1,2,3,4,5,6].map(value => {
          return <Die />
        })}
        {/* <Die value={1} />
        <Die value={2} />
        <Die value={3} />
        <Die value={4} />
        <Die value={5} />
        <Die value={6} /> */}
      </div>
    </>
  );
};

export default App;
