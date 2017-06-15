
export const captureConsoleErrors = fn => {
    const _console = console;
    global.console = { error: jest.fn() };
    try {
        fn();
    } finally {
        global.console = _console;
    }
};
