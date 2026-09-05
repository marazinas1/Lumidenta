// Shared Lumidenta email styling (sage palette, warm off-white, rounded shapes).
// Body background stays #ffffff per email best practice; the card carries the warmth.

export const BRAND = {
  ink: '#181A12',
  inkSoft: '#6B6F60',
  line: '#E8E4D8',
  sage: '#5C7A52',
  sageDeep: '#3F5738',
  sageTint: '#E4EEDA',
  paper: '#FAFAF6',
}

const fontStack =
  "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: fontStack,
  margin: '0',
  padding: '0',
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '32px 24px 40px',
}

export const card = {
  backgroundColor: BRAND.paper,
  border: `1px solid ${BRAND.line}`,
  borderRadius: '18px',
  padding: '32px 28px',
}

export const brandRow = {
  fontSize: '18px',
  fontWeight: 700 as const,
  letterSpacing: '-0.02em',
  color: BRAND.sageDeep,
  margin: '0 0 24px',
}

export const h1 = {
  fontSize: '22px',
  fontWeight: 700 as const,
  letterSpacing: '-0.02em',
  color: BRAND.ink,
  margin: '0 0 16px',
}

export const text = {
  fontSize: '15px',
  color: BRAND.inkSoft,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const link = { color: BRAND.sageDeep, textDecoration: 'underline' }

export const button = {
  display: 'inline-block',
  backgroundColor: BRAND.sage,
  color: '#FAFAF6',
  fontSize: '15px',
  fontWeight: 600 as const,
  border: `1px solid ${BRAND.sage}`,
  borderRadius: '999px',
  padding: '13px 26px',
  textDecoration: 'none',
}

export const code = {
  fontSize: '30px',
  fontWeight: 700 as const,
  letterSpacing: '0.16em',
  color: BRAND.sageDeep,
  backgroundColor: BRAND.sageTint,
  borderRadius: '14px',
  padding: '18px 20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

export const divider = {
  borderTop: `1px solid ${BRAND.line}`,
  margin: '28px 0 18px',
}

export const footer = {
  fontSize: '12px',
  color: BRAND.inkSoft,
  lineHeight: '1.6',
  margin: '0',
}

// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
export const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-card { background-color: #14170F !important; border-color: #2C3226 !important; }
    .dm-h1 { color: #F2F4EC !important; }
    .dm-text { color: #B6BCAB !important; }
    .dm-btn { background-color: #C7D9B4 !important; border-color: #C7D9B4 !important; color: #181A12 !important; }
  }
`
