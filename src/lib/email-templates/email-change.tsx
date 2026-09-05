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

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="lt" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Patvirtinkite el. pašto keitimą – {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-card" style={card}>
          <Text style={brandRow}>{siteName}</Text>
          <Heading className="dm-h1" style={h1}>
            Patvirtinkite el. pašto keitimą
          </Heading>
          <Text className="dm-text" style={text}>
            Gavome prašymą pakeisti jūsų {siteName} paskyros el. pašto adresą
            {oldEmail ? ` iš ${oldEmail}` : ''}
            {newEmail ? ` į ${newEmail}` : ''}.
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Patvirtinti keitimą
          </Button>
          <Hr style={divider} />
          <Text style={footer}>
            Jei šio keitimo neprašėte, šį laišką ignoruokite – adresas liks
            nepakeistas.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
