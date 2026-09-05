import * as React from 'react'

import {
  Body,
  Button,
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
  button,
  card,
  container,
  darkModeCss,
  divider,
  footer,
  h1,
  main,
  text,
} from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Slaptažodžio atkūrimas – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>{siteName}</Text>
          <Heading className="dm-h1" style={h1}>
            Slaptažodžio atkūrimas
          </Heading>
          <Text className="dm-text" style={text}>
            Gavome prašymą atkurti jūsų {siteName} paskyros slaptažodį.
            Paspauskite mygtuką žemiau ir pasirinkite naują slaptažodį.
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Nustatyti naują slaptažodį
          </Button>
          <Hr style={divider} />
          <Text style={footer}>
            Jei slaptažodžio keisti neprašėte, šį laišką galite ignoruoti –
            slaptažodis liks nepakeistas.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
