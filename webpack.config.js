import HtmlInlineScriptPlugin from "html-inline-script-webpack-plugin";
import StylelintWebpackPlugin from "stylelint-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import EslintWebpackPlugin from "eslint-webpack-plugin";
import HTMLWebpackPlugin from "html-webpack-plugin";
import { fileURLToPath } from "url";
import webpack from 'webpack'
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";

const config = {
  mode: isDev ? "development" : "production",
  entry: "./app/index.jsx",
  output: {
    publicPath: "",
    filename: isDev ? "[name].js" : "[contenthash:6].[name].js",
    assetModuleFilename: "images/[contenthash:6].[ext]",
    path: path.join(__dirname, "dist"),
    clean: true,
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(css|pcss)$/,
        use: [isDev ? "style-loader" : MiniCssExtractPlugin.loader].concat([
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[hash:base64:4]",
              },
            },
          },
          "less-loader",
          "postcss-loader"
        ]),
      },
      {
        test: /\.(svg)$/i,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|ttf)$/i,
        type: "asset",
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: "all",
          name: "vendors",
          test: /node_modules/,
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.MODE': JSON.stringify(process.env.NODE_ENV),
    }),
    new StylelintWebpackPlugin(),
    new EslintWebpackPlugin({
      extensions: ["ts", "tsx", "js", "jsx"],
    }),
    new HTMLWebpackPlugin({
      template: "./app/index.html",
      title: 'Authenticator',
      favicon: './app/assets/images/lock.png',
    }),
    new HtmlInlineScriptPlugin({
      scriptMatchPattern: [/telegram-web-apps/],
    }),
    new webpack.ProvidePlugin({
      buffer: ['buffer', 'Buffer'],
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      '@lib': path.resolve(__dirname, "./app/lib"),
      '@store': path.resolve(__dirname, "./app/store"),
      '@helper': path.resolve(__dirname, "./app/helper"),
      '@reducers': path.resolve(__dirname, "./app/reducers"),
      '@middleware': path.resolve(__dirname, "./app/middleware"),
      '@containers': path.resolve(__dirname, "./app/containers"),
      '@components': path.resolve(__dirname, "./app/components"),
    }
  },
  devServer: {
    allowedHosts: "all",
    port: 9000,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};

if (!isDev) {
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: isDev ? "[name].js" : "[contenthash:6].[name].css",
    })
  );
}

export default config;
