import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import { Link } from "react-router";

import MediaImage from "@components/MediaImage";
import useAsync from "@hooks/useAsync";
import { getBanners } from "@services/bannerService";

import "./HeroSection.css";

function HeroSection() {
  const { data, isLoading, error } = useAsync(() => getBanners({ limit: 5 }), []);

  if (isLoading) {
    return (
      <div className="hero hero--loading">
        <Container>
          <Placeholder as="div" animation="glow" className="hero__placeholder">
            <Placeholder xs={4} size="lg" />
            <Placeholder xs={7} />
            <Placeholder xs={2} size="lg" />
          </Placeholder>
        </Container>
      </div>
    );
  }

  if (error || !data?.data.length) {
    return <div className="hero hero--empty" aria-hidden="true" />;
  }

  return (
    <Carousel className="hero" indicators controls interval={6000}>
      {data.data.map((banner, index) => (
        <Carousel.Item key={banner.id}>
          <div className="hero__slide sf-media">
            <MediaImage width={1920} src={banner.image.url} alt={banner.image.alt} />
            <div className="hero__overlay" />
            <Container className="hero__content">
              <p className="hero__eyebrow">Featured story</p>
              <h1 className="hero__title">{banner.title}</h1>
              <p className="hero__excerpt">{banner.excerpt}</p>
              {banner.linkUrl ? (
                <Link to={banner.linkUrl} className="btn btn-primary">
                  {banner.linkLabel}
                </Link>
              ) : null}
            </Container>
            <span className="hero__number">{String(index + 1).padStart(2, "0")}</span>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default HeroSection;
