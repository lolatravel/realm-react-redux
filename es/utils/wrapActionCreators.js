import bindActionCreators from '../actions';

export default function wrapActionCreators(actionCreators) {
  return function (dispatch) {
    return bindActionCreators(actionCreators, dispatch);
  };
}