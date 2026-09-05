import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
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
  link,
  main,
  text,
} from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Kvietimas prisijungti – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>{siteName}</Text>
          <Heading className="dm-h1" style={h1}>
            Kvietimas prisijungti
          </Heading>
          <Text className="dm-text" style={text}>
            Jūs pakviesti prisijungti prie{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>{' '}
            valdymo skydelio. Paspauskite mygtuką žemiau, kad priimtumėte
            kvietimą ir susikurtumėte slaptažodį.
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Priimti kvietimą
          </Button>
          <Hr style={divider} />
          <Text style={footer}>
            Jei šio kvietimo nesitikėjote, šį laišką galite tiesiog ignoruoti.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
