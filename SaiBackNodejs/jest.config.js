module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|jsx|tsx)?$",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!nanoid).+\\.js$", // Transforma todo en node_modules *excepto* nanoid
  ],
  moduleFileExtensions: ["js", "json", "node"],
};
