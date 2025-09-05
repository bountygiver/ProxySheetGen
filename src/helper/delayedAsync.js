// Returns a function that only starts the function provided in the job parameter when it is first called, subsequent calls will return the same promise.
export default function delayedAsync(job) {
  const { promise, resolve } = Promise.withResolvers();
  let started = false;

  return function () {
    started = started || job().then(resolve) || true;
    return promise;
  };
}
