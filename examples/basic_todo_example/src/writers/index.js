import { combineWriters } from 'realm-react-redux';
import todoWriter from './todo';

export default combineWriters([todoWriter]);
