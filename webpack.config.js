const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const webpack = require("webpack");

const deps = require("./package.json").dependencies;

module.exports = (_, args) => {
  const isProduction = args.mode == "production" ? true : false;

  const port = args.port ?? 3000;

  const productionPlugins = [
    new ModuleFederationPlugin({
      name: "shell",
      filename: "remoteEntry.js",
      remotes: {
        microf_1: "microf_1@https://unpkg.com/microf_1@1.0.5/dist/microf_1.js",
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
  ];

  return {
    output: {
      filename: isProduction ? `[name].[contenthash].js` : `[name].js`,
      publicPath: isProduction
        ? `${process.env.REACT_APP_BASE_URL}/`
        : `http://localhost:${port}/`,
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      alias: {
        "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
        "react/jsx-runtime": require.resolve("react/jsx-runtime"),
      },
    },

    devServer: {
      port: port,
      historyApiFallback: true,
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                configFile: "tsconfig.json",
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },

    plugins: [
      ...productionPlugins,
      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      new webpack.ProvidePlugin({
        React: "react",
      }),
    ],
  };
};
