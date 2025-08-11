export function debounce(fn, delay) {
    let timeoutId = null;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}