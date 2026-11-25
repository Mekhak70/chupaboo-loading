export default function StructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.chupaboo.com/#organization",
          name: "Chupaboo",
          url: "https://www.chupaboo.com",
          logo: "https://www.chupaboo.com/logo.png",
          description:
            "Natural ingredient cakes and treats for pets.",
          sameAs: [
            "https://www.instagram.com/chupabooo/",
          ],
        },
        {
          "@type": "WebSite",
          "@id": "https://www.chupaboo.com/#website",
          url: "https://www.chupaboo.com",
          name: "Chupaboo",
          alternateName: "Chupaboo Pet Cakes",
          publisher: {
            "@id": "https://www.chupaboo.com/#organization",
          },
          inLanguage: ["hy", "en", "ru", "pl"],
        },
        {
          "@type": "OnlineStore",
          "@id": "https://www.chupaboo.com/#store",
          name: "Chupaboo",
          url: "https://www.chupaboo.com",
          description:
            "Natural ingredient pet cakes, birthday cakes and treats for dogs and cats.",
          currenciesAccepted: "AMD",
          areaServed: {
            "@type": "Country",
            name: "Armenia",
          },
          parentOrganization: {
            "@id": "https://www.chupaboo.com/#organization",
          },
        },
      ],
    }
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />
    )
  }