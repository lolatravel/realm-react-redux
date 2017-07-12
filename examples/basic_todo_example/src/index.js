import React, { Component } from 'react';
import { RealmProvider } from 'realm-react-redux';
import { configureRealmStore } from './configureStore';
import ToDoListContainer from './containers/ToDoListContainer';

const realmStore = configureRealmStore();

export class ToDoApp extends Component {
    render() {
        return (
            <RealmProvider store={realmStore}>
                <ToDoListContainer />
            </RealmProvider>
        );
    }
}
