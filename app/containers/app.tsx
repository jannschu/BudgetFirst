import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as React from 'react';

import Counter from '../components/Counter';
import * as CounterActions from '../actions/counter';

// It would be nice to specify an AppProps interface for this component, but it
// does not play nicely with the {() => <App/>} usage in main.
class App extends React.Component<any, any> {
  render() {
    const { counter, dispatch } = this.props;
    const actions = bindActionCreators(CounterActions, dispatch);

    return (
      <div className="counterApp">
        <Counter increment={actions.increment} decrement={actions.decrement} counter={counter} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  counter: state.counter
});

export default connect(mapStateToProps)(App);