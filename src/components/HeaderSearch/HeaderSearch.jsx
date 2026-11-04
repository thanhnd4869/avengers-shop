import { useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router";

import Icon from "@components/Icon";
import { PATHS } from "@routes/paths";

import "./HeaderSearch.css";

/**
 * The header's search icon. It opens a small dialog with one field; Enter
 * shows what matches across the site, games and blog posts alike.
 */
function HeaderSearch({ className = "header__icon-button" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const term = query.trim();

    if (!term) return;

    navigate(`${PATHS.SEARCH}?q=${encodeURIComponent(term)}`);
    close();
  };

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label="Search"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="search" size={16} />
      </button>
      <Modal
        show={open}
        onHide={close}
        centered
        className="header-search"
        aria-labelledby="header-search-title"
      >
        <Modal.Body className="header-search__body">
          <button type="button" className="header-search__close" aria-label="Close" onClick={close}>
            <Icon name="close" size={14} />
          </button>
          <h2 id="header-search-title" className="header-search__title">
            Search
          </h2>
          <Form role="search" onSubmit={handleSubmit}>
            <Form.Control
              type="search"
              name="q"
              placeholder="Type something and press Enter"
              aria-label="Search the site"
              maxLength={100}
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default HeaderSearch;
