import webpack from 'webpack';
import path from 'path';

/**
 * @type {import('webpack').Configuration}
 */
const configuration = {
  target: ['web', 'browserslist'],
  mode: 'production',
  entry: {
    main: path.resolve(process.cwd(), 'src', 'browser', 'bootstrap.ts')
  },
  optimization: {
    splitChunks: {
      chunks: 'all', // Split both sync and async chunks
      minSize: 20000, // Minimum size (in bytes) for a chunk to be split
      maxSize: 70000, // Maximum size for chunks
      minChunks: 1, // Minimum times a module is shared before splitting
      automaticNameDelimiter: '~', // Delimiter for named chunks
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(process.cwd(), 'dist', 'browser'),
    clean: true,
    chunkFormat: 'module',
    module: true
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: path.resolve(
            process.cwd(),
            'webpack',
            'babel',
            'babel.react-compiler.loader.js'
          )
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },

      {
        test: /\.(gif|svg|jpg|png|webp)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    },
    fallback: {
      path: false,
      process: false,
      fs: false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.EnvironmentPlugin({ ...process.env }),
    new webpack.ProgressPlugin()
  ]
};

export default configuration;
