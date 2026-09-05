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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Prisijungimo nuoroda – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>{siteName}</Text>
          <Heading className="dm-h1" style={h1}>
            Prisijungimo nuoroda
          </Heading>
          <Text className="dm-text" style={text}>
            Paspauskite mygtuką žemiau, kad prisijungtumėte prie {siteName}.
            Nuoroda netrukus nustos galioti.
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Prisijungti
          </Button>
          <Hr style={divider} />
          <Text style={footer}>
            Jei nuorodos neprašėte, šį laišką galite tiesiog ignoruoti.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
