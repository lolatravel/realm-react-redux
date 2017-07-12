
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
