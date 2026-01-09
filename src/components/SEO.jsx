import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title = "Nexo - Connect. Work. Grow. | Home Services on WhatsApp",
  description = "Fast, reliable and affordable home services from verified experts. Book AC, electrical, plumbing, cleaning, and 200+ services on WhatsApp. Response under 2 minutes.",
  keywords = "home services, AC service, electrical work, plumbing, cleaning services, WhatsApp booking, verified technicians, home maintenance",
  image = "/logo.png", // Using logo.png from public folder
  url = "",
  type = "website"
}) => {
  const fullTitle = title.includes("Nexo") ? title : `${title} | Nexo`
  const siteUrl = "https://nexo.works" // Updated domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Nexo" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content="Nexo" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@nexo" />

      {/* Additional */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#214A73" />
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Nexo Home Services",
          "description": description,
          "url": fullUrl,
          "logo": `${siteUrl}/logo.png`,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9590926068",
            "contactType": "Customer Service",
            "availableLanguage": ["English", "Hindi"]
          },
          "areaServed": {
            "@type": "Country",
            "name": "India"
          },
          "serviceType": "Home Services",
          "provider": {
            "@type": "Organization",
            "name": "Nexo",
            "url": siteUrl
          }
        })}
      </script>
    </Helmet>
  )
}

export default SEO

