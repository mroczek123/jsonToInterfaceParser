const path = require("path");

module.exports = {
  entry: "./main.ts",
  mode: "development",
  target: "node",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts",]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  }
};
