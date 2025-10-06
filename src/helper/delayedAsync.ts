// Returns a function that only starts the function provided in the job parameter when it is first called, subsequent calls will return the same promise.
export default function delayedAsync<T>(job: () => Promise<T>) {
  const { promise, resolve } = Promise.withResolvers<T>();
  let started: boolean | Promise<void | T> = false;

  return function () {
    started = started || job().then(resolve) || true;
    return promise;
  };
}
