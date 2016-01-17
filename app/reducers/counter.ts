import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER,
} from "../constants/action_types";


export default function counter(state = 0, action: any) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    default:
      return 0;
  }
}
