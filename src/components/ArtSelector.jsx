import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useState, useEffect, useContext, createContext } from "react";

const ArtContext = createContext();

const artCache = {};

const fetchResolve = (data) => {
  if (data.has_more) {
    return fetch(data.next_page)
      .then((r) => r.json())
      .then(fetchResolve)
      .then((d) => [...data.data, ...d]);
  } else {
    return data.data;
  }
};

const getArt = function (cardName) {
  if (artCache[cardName]) {
    return Promise.resolve(artCache[cardName]);
  }
  return fetch(
    `https://api.scryfall.com/cards/search/?q=${encodeURIComponent(
      `!"${cardName}"`
    )}&page=1&unique=art`
  )
    .then((r) => r.json())
    .then(fetchResolve)
    .then((d) => {
      artCache[cardName] = d;
      return d;
    });
};

const ArtOptions = function ({ results }) {
  const { handleSubmit } = useContext(ArtContext);
  if (!results?.length) {
    return <div>No Results found</div>;
  }
  return results.map((card, i) => (
    <img
      key={i}
      style={{ cursor: "pointer" }}
      src={
        card?.image_uris?.small ??
        card?.card_faces?.find((c) => c.object == "card_face")?.image_uris
          ?.small
      }
      onClick={() => handleSubmit(card)}
    />
  ));
};

function Loading() {
  return <Spinner animation="border mx-auto" />;
}

export default function ({ card, visible, handleClose, handleSubmit }) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (card?.name && visible && !result) {
      getArt(card.name).then(setResult);
    }
  }, [card, visible]);
  return (
    <Modal show={visible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Art selector for {card?.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ArtContext.Provider value={{ handleSubmit }}>
          <div
            className="d-flex flex-wrap overflow-y-auto gap-1"
            style={{ maxHeight: "50vh" }}
          >
            {(result && <ArtOptions results={result} />) || <Loading />}
          </div>
        </ArtContext.Provider>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} variant="secondary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
