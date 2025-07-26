declare module '*.json' {
  const value: Record<string, string | number | boolean | object>;
  export default value;
}