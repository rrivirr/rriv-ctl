/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(j|t)sx?$": ["ts-jest"],
  },
  transformIgnorePatterns: ["/node_modules/(?!lowdb|steno|yoctocolors)"],
  resetMocks: true,
};
