import { Colors } from "./types";

export const baseColors = {
  failure: "#FB0242",
  primary: "#1FC7D4",
  primaryBright: "#53DEE9",
  primaryDark: "#DCE5ED",
  secondary: "#7645D9",
  success: "#31D0AA",
  warning: "#FFB237",
  white: "#ffffff",
};

export const brandColors = {
  binance: "#F0B90B",
};

export const lightColors: Colors = {
  ...baseColors,
  ...brandColors,
  background: "#ffffff",
  backgroundDisabled: "#E9EAEB",
  backgroundAlt: "#5E7CE2",
  text: "#040A20",
  textDisabled: "#BDC2C4",
  textSubtle: "#8f80ba",
  borderColor: "#E9EAEB",
  borderLight: "#DCE5ED",
  borderSecondary: "#5E7CE2",
  chatBgColor: "#F7F9FB",
};

export const darkColors: Colors = {
  ...baseColors,
  ...brandColors,
  secondary: "#9A6AFF",
  background: "#040A20",
  backgroundDisabled: "#3c3742",
  backgroundAlt: "#5e647c",
  primaryDark: "#1e2745",
  text: "#ffffff",
  textDisabled: "#BDC2C4",
  textSubtle: "#5e647c",
  borderColor: "#161D34",
  borderLight: "#343637",
  borderSecondary: "#4285f4",
  chatBgColor: "#161d34",
};
