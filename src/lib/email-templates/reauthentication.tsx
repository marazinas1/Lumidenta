import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import {
  brandRow,
  card,
  code,
  container,
  darkModeCss,
  divider,
  footer,
  h1,
  main,
  text,
} from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Jūsų patvirtinimo kodas</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>Lumidenta</Text>
          <Heading className="dm-h1" style={h1}>
            Patvirtinkite tapatybę
          </Heading>
          <Text className="dm-text" style={text}>
            Įveskite šį kodą, kad patvirtintumėte savo tapatybę:
          </Text>
          <Text style={code}>{token}</Text>
          <Hr style={divider} />
          <Text style={footer}>
            Kodas netrukus nustos galioti. Jei jo neprašėte, šį laišką galite
            ignoruoti.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
