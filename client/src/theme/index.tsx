
import { Colors} from "./types";

export interface ApplicationTheme {
  isDark: boolean;
  colors: Colors;
}

export { default as dark } from "./dark";
export { default as light } from "./light";

export { lightColors } from "./colors";
export { darkColors } from "./colors";