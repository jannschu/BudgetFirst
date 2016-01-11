import {Component} from 'react';
import * as React from 'react';

interface CounterProps{
    increment: any;
    decrement: any;
    counter: number;
}
class Counter extends Component<CounterProps, any> {
  render() {
    const { increment, decrement, counter } = this.props
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
      </p>
    )
  }
}

export default Counter;
