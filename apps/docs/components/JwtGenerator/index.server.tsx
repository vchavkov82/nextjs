import { JwtGenerator as JwtGeneratorClient, JwtGeneratorSimple as JwtGeneratorSimpleClient } from './index'

const JwtGenerator = () => {
  return <JwtGeneratorClient />
}

const JwtGeneratorSimple = () => {
  return <JwtGeneratorSimpleClient />
}

export { JwtGenerator, JwtGeneratorSimple }
