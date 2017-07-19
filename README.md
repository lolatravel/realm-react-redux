
# Realm React Redux
[![Build Status](https://travis-ci.org/lolatravel/realm-react-redux.svg?branch=master)](https://travis-ci.org/lolatravel/realm-react-redux)

## Goal
The purpose of this project is to provide a reliable, consistent pattern for getting data from the mobile Realm database to React Native components. While there are a few ways this could be done, some of them much simpler, this project specifically follows the pattern of `redux` and `react-redux` for a few reasons:

- `redux` patterns are familiar to many developers, so following those patterns will make it easier for developers to introduce a persistent `Realm` store to their applications
- for projects already using `redux` (or projects that need both a `Realm` and `redux` store), this provides a similar pattern for accessing and updating both stores
- these patterns have proven to be successful and scale to large and complicated codebases

## Status
This project is currently experimental. It is being used in a couple of views in production here at lola and is working quite well, but the API is still likely to change and there may still be bugs in the more advanced use cases. If you are willing to experiment, please report any feedback or issues you encounter.

## Comparison to `redux` and `react-redux`
#### The store
A `Realm` store has the exact same API as a `redux` store, which means you can write and install middlewares the exact same way. Some `redux` middlewares may even work directly with the `Realm` store if they only inspect actions and do not rely on the state. With a `Realm` store, the `store.getState()` method returns a `Realm` instance instead of a state object.

#### Actions
Actions work the exact same way as they do in `redux`, and you can technically dispatch the same actions to both a `redux` store or a `Realm` store, although in practice it may be better to keep them separate.

#### Writers vs. Reducers
In `redux` you have a `reducer` that takes the current state and an action which it processes to return a new state. In `realm-react-redux` there is a similar concept: the `writer`. A `writer` takes a `Realm` instance and an action and writes to the `Realm` db. The `store` handles wrapping the entire thing in a single `realm.write()` transaction so your writers can focus on handling only creates/updates/deletes it needs. There is also a `combineWriters()` method which takes an array of writers and combines them into a single one for the store, very similar to `combineReducers()` in `redux`.

#### Provider
`react-redux` was designed with extensibility in mind so we can actually use its `Provider` class as is. As a convenience there is a `RealmProvider` exposed to handle setting up the proper `storeKey`, this is probably what you want to use.

#### Connect
Again, `react-redux` is quite extensible so we can re-use a lot of the libraries core code. However, in order to work with `Realm` the `connect()` API needed to be changed. 

| `connect`     | `realmConnect` |
| ------------- | -------------  |
| --  | `mapPropsToQueries(realm, ownProps)`   |
| `mapStateToProps(state, ownProps)`  | `mapQueriesToProps(queries, ownProps)` |
| `mapDispatchToProps(dispatch, ownProps)`  | `mapRealmDispatchToProps(dispatch, ownProps)` |
| `mergeProps(stateProps, dispatchProps, ownProps)`  | `mergeProps(queryProps, dispatchProps, ownProps)` |

## API Docs
#### Coming soon!

## Getting Started
#### Installation
 A real npm package is coming soon, but to start using right away:
`npm install https://github.com/lolatravel/realm-react-redux/tarball/v0.0.5`

#### Running the examples
There's only a basic example right now, more coming soon.

```sh
git clone git@github.com:lolatravel/realm-react-redux.git
cd realm-react-redux
npm install
cd examples/basic_todo_example
npm install
# if you don't have react-native-cli installed globally
npm install -g react-native-cli
react-native run-ios
```

### Basic Example
```javascript
// models.js
export class ToDo {
    static schema = {
        name: 'ToDo',
        primaryKey: 'id',
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            completed: { type: 'bool', default: false }
        }
    };
}
```
```javascript
// actions.js
export const CREATE_TODO = 'CREATE_TODO';
export const TOGGLE_TODO = 'TOGGLE_TODO';

export function createTodo(name) {
    return {
        type: CREATE_TODO,
        name
    };
}

export function toggleTodo(id) {
    return {
        type: TOGGLE_TODO,
        id
    };
}
```
```javascript
// writers.js
import uuid from 'uuid/v4';
import { CREATE_TODO, TOGGLE_TODO } from './actions';

export function todoWriter(realm, action) {
    switch (action.type) {
        case CREATE_TODO:
            const { name } = action;
            realm.create('ToDo', {
                id: uuid(),
                name
            });
            break;

        case TOGGLE_TODO:
            const { id } = action;
            const todos = realm.objects('ToDo').filtered(`id = "${id}"`);
            if (todos.length === 1) {
                const todo = todos[0];
                todo.completed = !todo.completed;
            }
            break;

        default:
            break;
    }
}
```
```javascript
// configureStore.js
import { createRealmStore, combineWriters } from 'realm-react-redux';
import { todoWriter } from './writers';
import { ToDo } from './models';

export function configureRealmStore() {
    // This will create a Realm instance to use in the store, using the options
    // passed in the second argument. To pass an existing Realm instance instead
    // you can use createRealmStore(writer, { realm: yourRealmInstance })
    return createRealmStore(combineWriters([todoWriter]), { schema: [ToDo] });
}
```
```javascript
// ToDoListContainer.js
import { bindActionCreators } from 'redux';
import { realmConnect } from 'realm-react-redux';
import { createTodo, toggleTodo } from './actions';
import ToDoList from './ToDoList';

function mapPropsToQueries(realm) {
    return [realm.objects('ToDo')];
}

function mapQueriesToProps([todos]) {
    return {
        // Normally you would use a selector here to create simplified versions
        // of the model containing only what's needed by the UI for rendering.
        todos: todos.map(t => { return { id: t.id, name: t.name, completed: t.completed }; })
    };
}

function mapRealmDispatchToProps(dispatch) {
    return bindActionCreators({
        createTodo,
        toggleTodo
    }, dispatch);
}
// The ToDoList component will now receive todos, createTodo, and toggleTodo as props
export default realmConnect(mapPropsToQueries, mapQueriesToProps, mapRealmDispatchToProps)(ToDoList);
```

## LICENSE
[MIT](LICENSE)
