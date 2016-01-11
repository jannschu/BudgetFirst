import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/action_types';



export default function counter(state=0, action:any){
    switch (action.type) {
        case INCREMENT_COUNTER:
            return state + 2;
            break;
        case DECREMENT_COUNTER:
            return state - 1;
            break;
        default:
            return 0;
            break;
    }
}
