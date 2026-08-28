
import { AvailabilityBand } from "@/components/home/AvailabilityBand";
import { BookingBand } from "@/components/home/BookingBand";
import { ExtrasSection } from "@/components/home/ExtrasSection";
import { Hero } from "@/components/home/Hero";
import { IntroStrip } from "@/components/home/IntroStrip";
import { LocationSection } from "@/components/home/LocationSection";
import { Ratings } from "@/components/home/Ratings";
import { getContent } from "@/content";
import { SITE_URL } from "@/data/nav";
import type { Locale } from "@/lib/locale";
import { pageHead } from "@/lib/seo";

export function homeRoute(locale: Locale) {
  const c = getContent(locale);
  const title = c.home.seoTitle;
  const description = c.home.seoDescription;

  return {
    head: () => ({
      ...pageHead({ path: "/", title, description, locale }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: "Dharma Stay",
            url: SITE_URL,
            description,
            email: "info@dharmastay.lt",
            telephone: "+37065911929",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Birutės g. 1",
              addressLocality: "Telšiai",
              postalCode: "87130",
              addressCountry: "LT",
            },
            priceRange: "€€",
          }),
        },
      ],
    }),
    component: Index,
  };
}

function Index() {
  return (
    <>
      <Hero />
      <IntroStrip />
      <AvailabilityBand />
      <LocationSection />
      <ExtrasSection />
      <Ratings />
      <BookingBand />
    </>
  );
}
