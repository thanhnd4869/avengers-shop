import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import GallerySection from "@components/GallerySection";
import HeroSection from "@components/HeroSection";
import HowItWorksSection from "@components/HowItWorksSection";
import MediaSidebar from "@components/MediaSidebar";
import NewsSection from "@components/NewsSection";
import PlatformSection from "@components/PlatformSection";
import ProductSection from "@components/ProductSection";
import Seo, { absoluteUrl } from "@components/Seo";
import TabbedNewsSection from "@components/TabbedNewsSection";
import TrustBar from "@components/TrustBar";
import { APP_NAME } from "@constants/app";
import { PATHS } from "@routes/paths";

import "./HomePage.css";

/*
 * Ordered along the buyer's journey on a game key store:
 *
 * 1. Trust    — is this shop legitimate? (TrustBar right under the hero)
 * 2. Browse   — which platform do I play on? (PlatformSection)
 * 3. Buy      — what is cheap, what is popular, what is new? (product rows)
 * 4. Learn    — how do I receive and activate a key? (HowItWorksSection)
 * 5. Engage   — news and media for returning visitors (blog, gallery, sidebar)
 *
 * No two neighbouring sections share a layout: the deals row spotlights one
 * title, the best sellers form a grid, the how-to breaks the run of products,
 * and the new releases scroll sideways. Each product row also answers a
 * different question, so the same titles do not keep resurfacing.
 */
export function Component() {
  return (
    <>
      <Seo
        path={PATHS.HOME}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: APP_NAME,
          url: absoluteUrl(PATHS.HOME),
          // Lets search engines offer a search box that opens the shop's search.
          potentialAction: {
            "@type": "SearchAction",
            target: `${absoluteUrl(PATHS.SEARCH)}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSection />

      <Container className="home-page">
        <TrustBar />
        <PlatformSection />

        <ProductSection
          highlight="Hot"
          title="Deals"
          collection="deals"
          limit={5}
          layout="spotlight"
        />
        <ProductSection highlight="Best" title="Sellers" sort="-sales" limit={6} layout="ranked" />

        <ProductSection
          highlight="New"
          title="Releases"
          collection="new-releases"
          limit={8}
          layout="carousel"
        />

        <HowItWorksSection />

        <NewsSection />

        {/* From here down the page splits into a content column and a sticky
            sidebar that spans the remaining sections. */}
        <Row className="gx-5">
          <Col lg={8}>
            <ProductSection
              highlight="Coming"
              title="Soon"
              collection="pre-orders"
              limit={4}
              variant="list"
              span={{ xs: 12, md: 6 }}
            />
            <TabbedNewsSection />
            <GallerySection />
          </Col>
          <Col lg={4}>
            <div className="home-page__sidebar">
              <MediaSidebar />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

Component.displayName = "HomePage";
