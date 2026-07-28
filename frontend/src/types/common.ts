export type Id = number;

export type IsoDateString = string;

export type SelectOption<T extends string | number = string> = {
  label: string;
  value: T;
};
