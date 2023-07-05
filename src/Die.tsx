import { Component, splitProps } from "solid-js";
import die1 from "/die_1.png";
import die2 from "/die_2.png";
import die3 from "/die_3.png";
import die4 from "/die_4.png";
import die5 from "/die_5.png";
import die6 from "/die_6.png";

const valueToImage = (value: Number) => {
  switch (value) {
    case 1:
      return die1;
    case 2:
      return die2;
    case 3:
      return die3;
    case 4:
      return die4;
    case 5:
      return die5;
    case 6:
      return die6;
    default:
      break;
  }
};

type DieType = {
  state: {
    value: number;
    index: number;
  };
  incrementValue: (index: number) => void;
};

const Die: Component<DieType> = (props) => {
  const [local, other] = splitProps(props, ["state", "incrementValue"]);
  return (
    <img
      class="w-32 cursor-pointer"
      src={valueToImage(local.state.value)}
      onClick={() => local.incrementValue(local.state.index)}
      draggable="false"
    />
  );
};

export default Die;
