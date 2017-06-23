import isPlainObject from 'lodash/isPlainObject';
import warning from './warning';

export function verifyPlainObject(value, displayName, methodName) {
  if (!isPlainObject(value)) {
    warning(methodName + '() in ' + displayName + ' must return a plain object. Instead received ' + value + '.');
  }
}

export function verifyArray(value, displayName, methodName) {
  if (!Array.isArray(value)) {
    warning(methodName + '() in ' + displayName + ' must return an array. Instead received ' + value + '.');
  }
}