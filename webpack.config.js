const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// DEMO_MODE: cuando es 'true', el build de produccion incluye
// mockServiceWorker.js en dist/ y MSW arranca aunque NODE_ENV sea
// 'production'. Util para demostrar el template sin backend real.
// Uso: DEMO_MODE=true npm run build   (o npm run build:demo)
// Un build de produccion real sin esta variable no cambia en absoluto.
const isDemoMode = process.env.DEMO_MODE === 'true';

// Feature flags ecommerce-ui — controlan si el dominio se sirve via
// mock o se delega al backend real.
//
// Semantica (tras T-019 de `revisar-arquitectura-de-mocks`):
//   'mock' (default) -> los handlers MSW del dominio se registran y
//                       el worker (dev) o el server (Jest) interceptan
//                       las requests a nivel de red.
//   'real'           -> los handlers del dominio NO se registran;
//                       la request sale al backend definido por
//                       API_URL en el host correspondiente.
//
// El switch vive en `src/mocks/handlers/index.ts#buildHandlers()`.
// El codigo de produccion (paginas, slices, apiService) NO conoce el
// modo: el bagde "Modo mock activo" que algunas paginas muestran solo
// lee la flag para senalizar al usuario; el flujo es identico en
// ambos modos.
//
// ADR: `dec-mocks-via-msw-service-worker`.
const defaultFlags = {
  CATALOG_SOURCE:  'mock',
  AUTH_SOURCE:     'mock',
  CART_SOURCE:     'mock',
  PAYMENTS_SOURCE: 'mock',
  PROFILE_SOURCE:  'mock',
};

// Lee .env.{NODE_ENV} y .env en ese orden
const envFiles = [
  `.env.${process.env.NODE_ENV || 'development'}`,
  '.env',
];

const parseEnvFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim();
    acc[key.trim()] = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    return acc;
  }, {});
};

const resolvedEnv = envFiles.reduce((acc, fileName) => {
  const filePath = path.resolve(__dirname, fileName);
  if (fs.existsSync(filePath)) return { ...acc, ...parseEnvFile(filePath) };
  return acc;
}, {});

const buildDefinedEnv = (mode) => {
  const pyVars = Object.entries({ ...defaultFlags, ...resolvedEnv }).reduce(
    (acc, [k, v]) => { acc[`process.env.${k}`] = JSON.stringify(v); return acc; },
    {}
  );
  return {
    ...pyVars,
    'process.env.NODE_ENV':   JSON.stringify(mode || 'production'),
    // API_URL: URL base del backend. En produccion con Nginx como proxy,
    // dejar vacio para que apiService use URLs relativas (/api/v1/...)
    // que Nginx intercepta y proxea a API_UPSTREAM configurado en el server.
    // Si se configura un valor absoluto, las llamadas van directamente a
    // ese host sin pasar por Nginx (util para backends en host separado).
    // Prioridad: variable de shell > .env.{NODE_ENV} > vacio.
    'process.env.API_URL':    JSON.stringify(
      process.env.API_URL || resolvedEnv.API_URL || ''
    ),
    'process.env.APP_VERSION': JSON.stringify(require('./package.json').version),
    // Timestamp ISO 8601 del momento en que webpack evaluo este config.
    // Usado por `window.__APP_CONFIG__` en runtime para que el operador
    // pueda confirmar qué build esta sirviendo el servidor.
    'process.env.BUILT_AT':    JSON.stringify(new Date().toISOString()),
    // DEMO_MODE: habilita MSW en el bundle de produccion para demostracion
    // sin backend real. Solo activo cuando se compila con DEMO_MODE=true.
    'process.env.DEMO_MODE':   JSON.stringify(process.env.DEMO_MODE || 'false'),
  };
};

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const analyze = process.env.ANALYZE === 'true';

  return {
    mode: argv.mode || 'production',
    entry: './src/index.jsx',

    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
      buildDependencies: { config: [__filename] },
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
      publicPath: '/',
      clean: true,
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        // Aliases ecommerce-ui-UI — sincronizar con jest.config.cjs moduleNameMapper
        '@app':        path.resolve(__dirname, 'src/app'),
        '@modules':    path.resolve(__dirname, 'src/modules'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks':      path.resolve(__dirname, 'src/hooks'),
        '@state':      path.resolve(__dirname, 'src/state'),
        '@redux':      path.resolve(__dirname, 'src/redux'),
        '@services':   path.resolve(__dirname, 'src/services'),
        '@mocks':      path.resolve(__dirname, 'src/mocks'),
        '@styles':     path.resolve(__dirname, 'src/styles'),
        '@utils':      path.resolve(__dirname, 'src/utils'),
        '@types':      path.resolve(__dirname, 'src/types'),
        '@constants':  path.resolve(__dirname, 'src/constants'),
        '@pages':      path.resolve(__dirname, 'src/pages'),
        '@router':     path.resolve(__dirname, 'src/router'),
        '@config':     path.resolve(__dirname, 'src/config'),
        '@layouts':    path.resolve(__dirname, 'src/layouts'),
        '@context':    path.resolve(__dirname, 'src/context'),
        '@lib':        path.resolve(__dirname, 'src/lib'),
        '@facades':    path.resolve(__dirname, 'src/facades'),
        '@decorators': path.resolve(__dirname, 'src/decorators'),
        // @assets: alias para src/assets/ — requerido por los componentes del
        // sistema de diseno Yoruba (Header importa el logo con @assets/...).
        '@assets':     path.resolve(__dirname, 'src/assets'),
      },
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        {
          test: /\.(css|scss)$/i,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 8 * 1024 } },
          generator: { filename: 'images/[name].[hash:8][ext]' },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: { filename: 'fonts/[name].[hash:8][ext]' },
        },
        {
          test: /\.svg$/i,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 4 * 1024 } },
        },
      ],
    },

    optimization: {
      minimize: !isDev,
      minimizer: !isDev ? [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info'],
            },
            format: { comments: false },
          },
          extractComments: false,
        }),
      ] : [],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /[/\\]node_modules[/\\](react|react-dom|react-router)[/\\]/,
            name: 'react-vendors',
            priority: 11,
            reuseExistingChunk: true,
          },
          redux: {
            test: /[/\\]node_modules[/\\](redux|react-redux|@reduxjs)[/\\]/,
            name: 'redux-vendors',
            priority: 12,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[/\\]node_modules[/\\](recharts|d3)[/\\]/,
            name: 'charts-vendors',
            priority: 13,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[/\\]node_modules[/\\]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            name: 'common',
          },
        },
        minSize: 20000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
      },
      runtimeChunk: { name: 'runtime' },
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: true,
        minify: !isDev && {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
      }),
      new webpack.DefinePlugin(buildDefinedEnv(argv.mode)),
      !isDev && new MiniCssExtractPlugin({ filename: '[name].[contenthash].css', ignoreOrder: true }),
      // DEMO_MODE: copiar mockServiceWorker.js y las imagenes del catalogo
      // a dist/ solo cuando DEMO_MODE=true. En builds de produccion real
      // este plugin no se activa y ninguno de estos assets aparece en dist/.
      // Las imagenes del catalogo son 320 PNGs (~24 MB); solo se incluyen
      // en el build de demostracion para no engordar el bundle de produccion.
      isDemoMode && new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/mockServiceWorker.js'),
            to:   path.resolve(__dirname, 'dist/mockServiceWorker.js'),
          },
          {
            from: path.resolve(__dirname, 'public/catalog/images'),
            to:   path.resolve(__dirname, 'dist/catalog/images'),
          },
        ],
      }),
      analyze && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: path.resolve(__dirname, 'dist/bundle-report.html'),
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: path.resolve(__dirname, 'dist/bundle-stats.json'),
      }),
    ].filter(Boolean),

    devServer: {
      port: 3001,
      hot: true,
      historyApiFallback: true,
      compress: true,
      static: {
        directory: path.join(__dirname, 'public'),
        serveIndex: false,
      },
      setupExitSignals: true,
      watchFiles: {
        paths: ['src/**/*', 'public/**/*'],
        options: { usePolling: false },
      },
      webSocketServer: 'ws',
      proxy: [
        {
          context: ['/api'],
          // El fallback 'http://localhost:8000' es intencional para
          // desarrollo local: el backend Django corre tipicamente ahi.
          // En modo dev con MSW activo (NODE_ENV=development), las
          // requests interceptadas nunca llegan al proxy; solo las de
          // dominios sin handler (admin, orders, etc.) lo alcanzan.
          // En produccion este devServer no existe — el proxy es Nginx.
          target: process.env.API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      ],
      client: {
        overlay: { errors: true, warnings: false },
        logging: 'info',
        progress: true,
      },
    },

    devtool: isDev ? 'cheap-module-source-map' : 'source-map',

    performance: {
      hints: isDev ? false : 'warning',
      maxEntrypointSize: 300000,
      maxAssetSize: 250000,
      assetFilter: (name) =>
        !name.endsWith('.map') && !name.endsWith('.LICENSE.txt'),
    },
  };
};
