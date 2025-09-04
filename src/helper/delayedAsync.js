export default function delayedAsync(job) {
  const { promise, resolve } = Promise.withResolvers();
  let started = false;

  return function () {
    started = started || job().then(resolve) || true;
    return promise;
  };
}
