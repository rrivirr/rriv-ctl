import omelette from "omelette";
import { DefaultObject } from "./types.ts";

export default (tree: DefaultObject) => {
  const completion = omelette("rrivctlv2").tree(tree);
  completion.init();
  return completion;
};
