import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, NavLink, useLocation } from "react-router";

import RichText from "@components/RichText";
import Seo from "@components/Seo";
import { APP_NAME } from "@constants/app";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getPage } from "@services/pageService";
import { formatDate } from "@utils/format";

import "./ContentPage.css";

// The site's help and policy pages, keyed by route. Each route has its own
// path constant, so footer links stay readable; the slug is the API's.
const PAGES = [
  { path: PATHS.FAQ, slug: "faq", label: "Help centre" },
  { path: PATHS.REFUND_POLICY, slug: "refund-policy", label: "Refund policy" },
  { path: PATHS.TERMS, slug: "terms", label: "Terms of service" },
  { path: PATHS.PRIVACY, slug: "privacy", label: "Privacy policy" },
];

/**
 * The FAQ and the policies, read from the API so they can change without a
 * release. The FAQ shows its sections as an accordion of questions; the
 * policies as headed sections with a "last updated" date.
 */
export function Component() {
  const { pathname } = useLocation();
  const current = PAGES.find((page) => page.path === pathname) ?? PAGES[0];
  const { data, isLoading, error } = useAsync(() => getPage(current.slug), [current.slug]);
  const page = data?.data;
  const isFaq = current.slug === "faq";

  let body;

  if (isLoading) {
    body = (
      <Placeholder as="div" animation="glow" aria-label="Loading">
        <Placeholder xs={6} size="lg" />
        <Placeholder xs={12} className="mt-4" />
        <Placeholder xs={11} />
        <Placeholder xs={9} />
      </Placeholder>
    );
  } else if (!page) {
    body = (
      <div role="alert">
        <h1 className="content-page__title">{current.label}</h1>
        <p>
          {error?.status === 404
            ? "This page is not available yet."
            : "We could not load this page. Please try again later."}
        </p>
        <Button as={Link} to={PATHS.HOME} variant="primary">
          Back to home
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <h1 className="content-page__title">{page.title}</h1>
        {page.summary ? <p className="content-page__summary">{page.summary}</p> : null}
        {isFaq ? null : (
          <p className="content-page__updated">
            Last updated {formatDate(page.updatedAt, "en-US")}
          </p>
        )}

        {isFaq ? (
          <Accordion className="content-page__faq" alwaysOpen>
            {page.sections.map((section, index) => (
              <Accordion.Item key={section.heading} eventKey={String(index)}>
                <Accordion.Header as="h2">{section.heading}</Accordion.Header>
                <Accordion.Body>
                  <RichText text={section.body} />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          page.sections.map((section) => (
            <section key={section.heading} className="content-page__section">
              <h2 className="content-page__heading">{section.heading}</h2>
              <RichText text={section.body} />
            </section>
          ))
        )}
      </>
    );
  }

  return (
    <Container className="content-page">
      <Seo
        title={page?.title ?? current.label}
        description={page?.summary || `${current.label} of ${APP_NAME}.`}
        path={current.path}
        noIndex={!isLoading && !page}
        structuredData={
          isFaq && page
            ? {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: page.sections.map((section) => ({
                  "@type": "Question",
                  name: section.heading,
                  acceptedAnswer: { "@type": "Answer", text: section.body },
                })),
              }
            : undefined
        }
      />
      <div className="content-page__layout">
        <nav className="content-page__nav" aria-label="Help and policies">
          <ul>
            {PAGES.map((item) => (
              <li key={item.slug}>
                <NavLink to={item.path} className="content-page__link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <article className="content-page__body rounded">{body}</article>
      </div>
    </Container>
  );
}

Component.displayName = "ContentPage";
