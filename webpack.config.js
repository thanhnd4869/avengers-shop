const path = require("path");
const { existsSync } = require("fs");
const { loadEnvFile } = require("process");
const { DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const publicDir = path.resolve(__dirname, "public");

const envPath = path.resolve(__dirname, ".env");

if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

module.exports = (_, argv) => {
  // `npm run dev` and `npm run build` pass `--mode`; a bare `webpack` call
  // falls back to development instead of webpack's silent production default.
  const mode = argv.mode ?? "development";
  const isProduction = mode === "production";
  const devServerHost = process.env.HOST || "localhost";
  const devServerPort = Number.parseInt(process.env.PORT ?? "3000", 10);
  const apiUrl = process.env.WEBPACK_API_URL || "http://localhost:8000/api/v1";

  return {
    mode,
    dotenv: {
      prefix: "WEBPACK_",
    },
    entry: path.resolve(__dirname, "src/index.jsx"),
    output: {
      path: path.resolve(__dirname, "build"),
      filename: isProduction ? "static/js/[name].[contenthash:8].js" : "static/js/[name].js",
      clean: true,
      publicPath: "/",
    },
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
    devServer: {
      static: {
        directory: publicDir,
      },
      compress: true,
      historyApiFallback: true,
      hot: true,
      open: true,
      host: devServerHost,
      port: Number.isInteger(devServerPort) ? devServerPort : 3000,
    },
    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@constants": path.resolve(__dirname, "src/constants"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@routes": path.resolve(__dirname, "src/routes"),
        "@services": path.resolve(__dirname, "src/services"),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          type: "javascript/auto",
          use: "babel-loader",
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                // Root-relative URLs point at files served from `public/`, not at
                // modules to bundle, so leave them untouched like JSX `src` attributes.
                url: { filter: (url) => !url.startsWith("/") },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
          type: "asset",
          parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
          generator: { filename: "static/media/[name].[contenthash:8][ext]" },
        },
      ],
    },
    plugins: [
      // `dotenv.prefix` only replaces names that exist in .env, so any missing
      // one would be left as a `process` reference the browser cannot resolve.
      new DefinePlugin({
        "process.env.WEBPACK_APP_NAME": JSON.stringify(process.env.WEBPACK_APP_NAME ?? ""),
        "process.env.WEBPACK_API_URL": JSON.stringify(process.env.WEBPACK_API_URL ?? ""),
        "process.env.WEBPACK_SITE_URL": JSON.stringify(process.env.WEBPACK_SITE_URL ?? ""),
        "process.env.WEBPACK_ADMIN_URL": JSON.stringify(process.env.WEBPACK_ADMIN_URL ?? ""),
      }),
      new ESLintPlugin({
        context: path.resolve(__dirname, "src"),
        extensions: ["js", "jsx"],
        emitError: true,
        emitWarning: true,
        // A failed build stops the dev server watching, and every request
        // then waits for a rebuild that never comes. In development lint
        // errors are reported (overlay and terminal) and the server keeps
        // going; a production build still fails on them.
        failOnError: isProduction,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, "index.html"),
      }),
      // The dev server reads `public/` straight from disk, but a production
      // build has to copy it so files keep their exact URL (favicon.ico,
      // robots.txt, images referenced as `/assets/...`).
      isProduction &&
        new CopyPlugin({
          patterns: [
            {
              from: publicDir,
              to: path.resolve(__dirname, "build"),
              // HtmlWebpackPlugin renders the template with the hashed bundle
              // tags injected, so copying the raw file would overwrite it.
              globOptions: { ignore: ["**/index.html", "**/robots.txt"] },
              noErrorOnMissing: true,
            },
            {
              // The sitemap is built by the API from the live catalogue.
              from: path.resolve(publicDir, "robots.txt"),
              to: path.resolve(__dirname, "build/robots.txt"),
              transform: (content) =>
                content
                  .toString()
                  .replace("%SITEMAP_URL%", `${apiUrl.replace(/\/$/, "")}/sitemap.xml`),
            },
          ],
        }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
        }),
    ].filter(Boolean),
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
          },
        },
      },
      minimizer: [
        // Keeps the default JavaScript minifier.
        "...",
        new CssMinimizerPlugin(),
      ],
    },
    performance: {
      hints: isProduction ? "warning" : false,
    },
  };
};
