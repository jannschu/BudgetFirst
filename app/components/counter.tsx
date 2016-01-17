import * as React from "react";

interface ICounterProps {
  increment: any;
  decrement: any;
  counter: number;
}
class Counter extends React.Component<ICounterProps, any> {
  public render() {
    const { increment, decrement, counter } = this.props;
    return (
      <p>
        Click: {counter} times
        {" "}
        <button onClick={increment}>+</button>
        {" "}
        <button onClick={decrement}>-</button>
      </p>
    );
  }
}

export default Counter;
