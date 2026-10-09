// eslint-config-next ships a flat config as of Next 16.
import nextConfig from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      'out/**',
      'node_modules/**'
    ]
  },
  ...nextConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      // These components hydrate browser-only state after mount; a `useState`
      // initializer would render different markup on the server.
      'react-hooks/set-state-in-effect': 'off'
    }
  }
]

export default config
