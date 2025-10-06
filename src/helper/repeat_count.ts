export default function <T>(list: Array<T>, keyFunc?: (arg0: T) => string, valueFunc?: (arg0: T) => any, reduceFunc?: (arg0: any, arg1: any) => any) {
  if (!keyFunc) {
    keyFunc = function (v) {
      if (typeof v == "string") {
        return v
      }
      return JSON.stringify(v);
    }
  }
  if (!valueFunc) {
    valueFunc = () => 1;
  }
  if (!reduceFunc) {
    reduceFunc = function (currVal: T, newVal: T) {
      if (typeof currVal == "number" && typeof newVal == "number") {
        return (currVal || 0) + newVal;
      }
      return newVal;
    }
  }
  return list.reduce((currList: { [key: string]: any }, v) => {
    return {
      ...currList,
      [keyFunc(v)]: reduceFunc(currList[keyFunc(v)], valueFunc(v))
    };
  }, {})
}