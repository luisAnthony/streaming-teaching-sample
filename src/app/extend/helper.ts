const Func = <T, V>(value: V, func: (value: V) => T): T => {
  return func(value);
}

export { Func };