module.exports = {
  testEnvironment: 'jsdom',
  // MSW v2: jsdom por defecto resuelve la condicion `browser` en `exports`
  // de package.json, lo que rompe las dependencias internas de MSW
  // (`@mswjs/interceptors`) que esperan condiciones de Node. Forzar
  // `['node', 'node-addons']` hace que jsdom resuelva paquetes como Node
  // tipico, manteniendo a `msw/node` funcional para los tests.
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  verbose: true,
  // MSW server intercepta el modulo http de Node y registra
  // listeners que jest no detecta como "open handles" pero
  // mantienen el proceso vivo. `forceExit` cierra el proceso
  // limpiamente tras ejecutar todos los tests. Se anadio al
  // integrar MSW (T-007 de revisar-arquitectura-de-mocks).
  forceExit: true,

  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': 'babel-jest',
  },

  // MSW v2 y `@mswjs/interceptors` se publican como ESM puro. Babel-jest
  // los necesita transformados; el patron por defecto de Jest ignora
  // todo node_modules, asi que los exceptuamos explicitamente.
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@bundled-es-modules|@open-draft|outvariant|strict-event-emitter|until-async|headers-polyfill|rettime|@faker-js))',
  ],

  moduleNameMapper: {
    '\\.(css|scss|less|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',

    '^@/(.*)$':          '<rootDir>/src/$1',
    '^@app/(.*)$':       '<rootDir>/src/app/$1',
    '^@modules/(.*)$':   '<rootDir>/src/modules/$1',
    '^@components/(.*)$':'<rootDir>/src/components/$1',
    '^@hooks/(.*)$':     '<rootDir>/src/hooks/$1',
    '^@styles/(.*)$':    '<rootDir>/src/styles/$1',
    '^@state/(.*)$':     '<rootDir>/src/state/$1',
    '^@redux/(.*)$':     '<rootDir>/src/redux/$1',
    '^@services/(.*)$':  '<rootDir>/src/services/$1',
    '^@mocks/(.*)$':     '<rootDir>/src/mocks/$1',
    '^@utils/(.*)$':     '<rootDir>/src/utils/$1',
    '^@pages/(.*)$':     '<rootDir>/src/pages/$1',
    '^@router/(.*)$':    '<rootDir>/src/router/$1',
    '^@config/(.*)$':    '<rootDir>/src/config/$1',
    '^@layouts/(.*)$':   '<rootDir>/src/layouts/$1',
    '^@context/(.*)$':   '<rootDir>/src/context/$1',
    '^@lib/(.*)$':       '<rootDir>/src/lib/$1',
    '^@facades/(.*)$':   '<rootDir>/src/facades/$1',
    '^@decorators/(.*)$':'<rootDir>/src/decorators/$1',
    '^@types/(.*)$':     '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
  },

  testMatch: [
    '**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],

  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.jsx',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/mocks/**',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
