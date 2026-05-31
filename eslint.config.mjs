import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    rules: {
      'prefer-const': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
