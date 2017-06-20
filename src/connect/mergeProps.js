import { verifyPlainObject } from '../utils/verify';

export function defaultMergeProps(queryProps, dispatchProps, ownProps) {
    return { ...ownProps, ...queryProps, ...dispatchProps };
}

export function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, { displayName, pure, areMergedPropsEqual }) {
        let hasRunOnce = false;
        let mergedProps;

        return function mergePropsProxy(queryProps, dispatchProps, ownProps) {
            const nextMergedProps = mergeProps(queryProps, dispatchProps, ownProps)

            if (hasRunOnce) {
                if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) {
                    mergedProps = nextMergedProps;
                }

            } else {
                hasRunOnce = true;
                mergedProps = nextMergedProps;

                if (process.env.NODE_ENV !== 'production') {
                    verifyPlainObject(mergedProps, displayName, 'mergeProps');
                }
            }

            return mergedProps;
        }
    }
}

export function whenMergePropsIsFunction(mergeProps) {
    return (typeof mergeProps === 'function')
        ? wrapMergePropsFunc(mergeProps)
        : undefined;
}

export function whenMergePropsIsOmitted(mergeProps) {
    return (!mergeProps)
        ? () => defaultMergeProps
        : undefined;
}

export default [
    whenMergePropsIsFunction,
    whenMergePropsIsOmitted
];
