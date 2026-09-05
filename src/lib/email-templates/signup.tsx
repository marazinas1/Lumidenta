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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Patvirtinkite savo el. pašto adresą – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>{siteName}</Text>
          <Heading className="dm-h1" style={h1}>
            Patvirtinkite el. pašto adresą
          </Heading>
          <Text className="dm-text" style={text}>
            Sveiki! Jūsų paskyra{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>{' '}
            sistemoje beveik paruošta.
          </Text>
          <Text className="dm-text" style={text}>
            Patvirtinkite adresą{' '}
            <Link href={`mailto:${recipient}`} style={link}>
              {recipient}
            </Link>{' '}
            paspausdami mygtuką žemiau:
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Patvirtinti el. paštą
          </Button>
          <Hr style={divider} />
          <Text style={footer}>
            Jei paskyros nekūrėte, šį laišką galite tiesiog ignoruoti.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
