module.exports = {
    testMatch: [
      "**/server/**/*.test.js",
      "**/client/**/*.test.js"
    ],
    
    projects: [
      {
        displayName: "backend",
        testEnvironment: "node",
        testMatch: ["**/server/**/*.test.js"]
      },
      {
        displayName: "frontend",
        testEnvironment: "jsdom",
        testMatch: ["**/client/**/*.test.js"]
      }
    ]
  };