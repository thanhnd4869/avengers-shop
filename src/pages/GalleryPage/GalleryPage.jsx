import { useCallback, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import MediaSidebar from "@components/MediaSidebar";
import SectionHeading from "@components/SectionHeading";
import Seo from "@components/Seo";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getGalleries } from "@services/galleryService";
import { getMedia } from "@services/mediaService";
import { isVideoFile, videoUrl } from "@utils/media";

import "./GalleryPage.css";

const PICTURE_LIMIT = 12;
const VIDEO_LIMIT = 4;
const YOUTUBE_ID = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

/** Steps through a set of pictures; arrow keys move, Escape closes. */
function Lightbox({ title, images, index, onClose, onMove }) {
  const image = images[index];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [onMove]);

  if (!image) return null;

  return (
    <Modal
      show
      onHide={onClose}
      centered
      size="xl"
      className="gallery-lightbox"
      aria-label={`${title}: picture ${index + 1} of ${images.length}`}
    >
      <Modal.Body className="gallery-lightbox__body">
        <MediaImage width={1920} src={image.url} alt={image.alt} />
        <button
          type="button"
          className="gallery-lightbox__close"
          aria-label="Close"
          onClick={onClose}
        >
          <Icon name="close" size={16} />
        </button>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              aria-label="Previous picture"
              onClick={() => onMove(-1)}
            >
              <Icon name="chevron-left" size={18} />
            </button>
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              aria-label="Next picture"
              onClick={() => onMove(1)}
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </>
        ) : null}
        <p className="gallery-lightbox__count">
          {title} · {index + 1} / {images.length}
        </p>
      </Modal.Body>
    </Modal>
  );
}

/**
 * A YouTube video or an uploaded video file. Either loads only once it is
 * asked to play, so the page does not pull in YouTube (and its cookies) or a
 * large file for every visitor.
 */
function Video({ video }) {
  const [playing, setPlaying] = useState(false);
  const id = YOUTUBE_ID.exec(video.url)?.[1];
  const isFile = !id && isVideoFile(video.url);
  const title = video.title || video.image.alt;

  return (
    <figure className="gallery-page__video">
      <h3 className="gallery-page__video-title">{title}</h3>
      <div className="sf-media sf-ratio-16x9 rounded">
        {playing && id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : playing && isFile ? (
          <video src={videoUrl(video.url)} title={title} controls autoPlay playsInline />
        ) : id || isFile ? (
          <button
            type="button"
            className="gallery-page__video-poster sf-media-zoom"
            aria-label={`Play video: ${title}`}
            onClick={() => setPlaying(true)}
          >
            <MediaImage width={960} src={video.image.url} alt="" loading="lazy" />
            <span className="gallery-page__play" aria-hidden="true" />
          </button>
        ) : (
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="gallery-page__video-poster sf-media-zoom"
            aria-label={`Watch video: ${title} (opens in a new tab)`}
          >
            <MediaImage width={960} src={video.image.url} alt="" loading="lazy" />
            <span className="gallery-page__play" aria-hidden="true" />
          </a>
        )}
      </div>
    </figure>
  );
}

function TileSkeleton({ count, ratio, md, xs }) {
  return Array.from({ length: count }, (_, index) => (
    <Col key={index} xs={xs} md={md}>
      <Placeholder as="div" animation="glow">
        <Placeholder className={`d-block w-100 ${ratio} rounded`} />
      </Placeholder>
    </Col>
  ));
}

function Unavailable({ what }) {
  return (
    <p className="gallery-page__empty rounded" role="alert">
      We could not load the {what}. Please try again later.
    </p>
  );
}

/**
 * The gallery, laid out like the reference: the latest pictures, the
 * albums, then the videos, with the usual sidebar alongside.
 */
export function Component() {
  const pictures = useAsync(() => getMedia({ type: "screenshot", limit: PICTURE_LIMIT }), []);
  const albums = useAsync(() => getGalleries({ limit: 6 }), []);
  const videos = useAsync(() => getMedia({ type: "video", limit: VIDEO_LIMIT }), []);
  // What the lightbox shows: a title, its pictures and the one open.
  const [viewer, setViewer] = useState(null);

  const pictureList = pictures.data?.data ?? [];
  const albumList = albums.data?.data ?? [];
  const videoList = videos.data?.data ?? [];

  const move = useCallback(
    (step) =>
      setViewer((current) => ({
        ...current,
        index: (current.index + step + current.images.length) % current.images.length,
      })),
    [],
  );

  const openPictures = (index) =>
    setViewer({
      title: "Latest Pictures",
      images: pictureList.map((item) => ({ url: item.url, alt: item.image.alt })),
      index,
    });

  return (
    <Container className="gallery-page">
      <Seo
        title="Gallery"
        description="Screenshots, artwork albums and trailers of the games we sell."
        path={PATHS.GALLERY}
      />
      <h1 className="visually-hidden">Gallery</h1>
      <Row className="gx-5">
        <Col lg={8} className="gallery-page__main">
          <section aria-labelledby="latest-pictures">
            <SectionHeading highlight="Latest">
              <span id="latest-pictures">Pictures</span>
            </SectionHeading>
            {pictures.error ? (
              <Unavailable what="pictures" />
            ) : (
              <Row as="ul" className="g-2 gallery-page__list">
                {pictures.isLoading ? (
                  <TileSkeleton count={8} ratio="sf-ratio-1x1" xs={6} md={3} />
                ) : (
                  pictureList.map((item, index) => (
                    <Col as="li" key={item.id} xs={6} md={3}>
                      <button
                        type="button"
                        className="gallery-page__tile sf-media sf-media-zoom sf-ratio-1x1 rounded"
                        aria-label={`View picture ${index + 1} of ${pictureList.length}`}
                        onClick={() => openPictures(index)}
                      >
                        <MediaImage width={480} src={item.image.url} alt="" loading="lazy" />
                      </button>
                    </Col>
                  ))
                )}
              </Row>
            )}
          </section>

          <section className="gallery-page__section" aria-labelledby="recent-galleries">
            <SectionHeading highlight="Recent">
              <span id="recent-galleries">Galleries</span>
            </SectionHeading>
            {albums.error ? (
              <Unavailable what="galleries" />
            ) : (
              <Row as="ul" className="g-4 gallery-page__list">
                {albums.isLoading ? (
                  <TileSkeleton count={4} ratio="sf-ratio-4x3" xs={12} md={6} />
                ) : (
                  albumList.map((album) => (
                    <Col as="li" key={album.id} xs={12} md={6}>
                      <button
                        type="button"
                        className="gallery-page__album"
                        disabled={!album.images.length}
                        aria-label={`Open ${album.title}, ${album.images.length} pictures`}
                        onClick={() =>
                          setViewer({ title: album.title, images: album.images, index: 0 })
                        }
                      >
                        <span className="gallery-page__album-cover sf-media sf-media-zoom sf-ratio-4x3 rounded">
                          <MediaImage width={640} src={album.cover.url} alt="" loading="lazy" />
                          <span className="gallery-page__album-count">{album.images.length}</span>
                        </span>
                        <span className="gallery-page__album-title">{album.title}</span>
                      </button>
                    </Col>
                  ))
                )}
              </Row>
            )}
          </section>

          <section className="gallery-page__section" aria-labelledby="video-galleries">
            <SectionHeading highlight="Video">
              <span id="video-galleries">Galleries</span>
            </SectionHeading>
            {videos.error ? (
              <Unavailable what="videos" />
            ) : (
              <Row className="g-4">
                {videos.isLoading ? (
                  <TileSkeleton count={2} ratio="sf-ratio-16x9" xs={12} md={6} />
                ) : (
                  videoList.map((video) => (
                    <Col key={video.id} xs={12} md={6}>
                      <Video video={video} />
                    </Col>
                  ))
                )}
              </Row>
            )}
          </section>
        </Col>
        <Col lg={4}>
          <div className="gallery-page__sidebar">
            <MediaSidebar />
          </div>
        </Col>
      </Row>

      {viewer ? (
        <Lightbox
          title={viewer.title}
          images={viewer.images}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onMove={move}
        />
      ) : null}
    </Container>
  );
}

Component.displayName = "GalleryPage";
