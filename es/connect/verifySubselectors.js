import warning from '../utils/warning';

function verify(selector, methodName, displayName) {
    if (!selector) {
        throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
    } else if (methodName === 'mapPropsToQueries' || methodName === 'mapQueriesToProps' || methodName === 'mapDispatchToProps') {
        if (!selector.hasOwnProperty('dependsOnOwnProps')) {
            warning('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
        }
    }
}

export default function verifySubselectors(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapPropsToQueries, 'mapPropsToQueries', displayName);
    verify(mapQueriesToProps, 'mapQueriesToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
}