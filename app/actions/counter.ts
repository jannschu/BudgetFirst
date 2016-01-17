import * as action_types from '../constants/action_types';

export function increment() {
  return {
    type: action_types.INCREMENT_COUNTER
  }
}

export function decrement() {
  return {
    type: action_types.DECREMENT_COUNTER
  }
}