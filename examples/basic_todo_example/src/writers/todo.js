import uuid from 'uuid/v4';
import { CREATE_TODO, TOGGLE_TODO } from '../actions/todo';

export default function todoWriter(realm, action) {
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
