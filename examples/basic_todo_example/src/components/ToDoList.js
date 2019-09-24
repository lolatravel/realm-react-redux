import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    ScrollView,
    View,
    TouchableHighlight
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scroll: {
        width: '100%'
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    todo: {
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: '#AAA'
    },
    todoText: {
        fontSize: 18,
        padding: 15
    },
    completedTodoText: {
        textDecorationLine: 'line-through'
    },
    addButton: {
        backgroundColor: 'blue',
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center'
    },
    buttonDisabled: {
        opacity: 0.4
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    input: {
        width: '80%',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#AAA'
    }
});

export default class ToDoList extends Component {
    static propTypes = {
        todos: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        })).isRequired,
        createTodo: PropTypes.func.isRequired,
        toggleTodo: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.updateText = this.updateText.bind(this);
        this.addTodo = this.addTodo.bind(this);
        this.toggleTodo = this.toggleTodo.bind(this);
        this.state = { text: '' };
    }

    updateText(text) {
        this.setState({ text });
    }

    addTodo() {
        const { createTodo } = this.props;
        const { text } = this.state;
        this.setState({ text: '' });
        createTodo(text);
    }

    toggleTodo(todo) {
        const { toggleTodo } = this.props;
        toggleTodo(todo.id);
    }

    renderTodo(todo) {
        return (
            <TouchableHighlight key={todo.id} style={styles.todo} onPress={() => this.toggleTodo(todo)}>
                <Text style={[styles.todoText, todo.completed && styles.completedTodoText]}>
                    {todo.name}
                </Text>
            </TouchableHighlight>
        );
    }

    render() {
        const { todos = [] } = this.props;
        const { text } = this.state;
        const buttonDisabled = !text;
        return (
            <View style={styles.container}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
                    {todos.map(todo => this.renderTodo(todo))}
                    <TextInput
                        placeholder='Add your todo'
                        style={styles.input}
                        value={text}
                        onChangeText={this.updateText}
                    />
                </ScrollView>
                <TouchableHighlight
                    style={[styles.addButton, buttonDisabled && styles.buttonDisabled]}
                    onPress={this.addTodo}
                    disabled={buttonDisabled}
                >
                    <Text style={styles.addButtonText}>
                        Add Todo
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }
}
