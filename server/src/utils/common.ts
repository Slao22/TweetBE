export const numberEnumToArray = (enumObj: { [key: string]: string | number }) => {
  return Object.values(enumObj).filter((value) => typeof value === "number") as number[]
}
