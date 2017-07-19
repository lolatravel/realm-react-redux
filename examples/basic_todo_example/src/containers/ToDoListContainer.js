import { bindActionCreators } from 'redux';
import { realmConnect } from 'realm-react-redux';
import { createTodo, toggleTodo } from '../actions/todo';
import ToDoList from '../components/ToDoList';

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

export default realmConnect(mapPropsToQueries, mapQueriesToProps, mapRealmDispatchToProps)(ToDoList);
