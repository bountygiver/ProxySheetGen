import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useState, useEffect, useContext, createContext } from "react";
import { Card } from '../models/card';
import { ScryfallResults } from '../models/scryfall_results';

type ArtContextType = {
  handleSubmit: (card: Card) => void,
}

const ArtContext = createContext<ArtContextType>({
  handleSubmit: (_) => { }
});

const artCache: { [key: string]: Promise<Card[]> } = {};

const fetchResolve = (data: ScryfallResults): Promise<Card[]> => {
  if (data.has_more && data.next_page) {
    return fetch(data.next_page)
      .then((r) => r.json())
      .then(fetchResolve)
      .then((d) => [...data.data, ...d]);
  } else {
    return Promise.resolve(data.data);
  }
};

const getArt = function (oracle_id: string) {
  if (!artCache[oracle_id]) {
    artCache[oracle_id] = fetch(
      `https://api.scryfall.com/cards/search/?q=${encodeURIComponent(
        `oracleid:"${oracle_id}" include:extras`
      )}&page=1&unique=art`
    )
      .then((r) => r.json())
      .then(fetchResolve);
  }
  return artCache[oracle_id];
};

const ArtOptions = function ({ results }: { results: Card[] }) {
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
  return <Spinner animation="border" className="mx-auto" />;
}

export default function ({ card, visible, handleClose, handleSubmit }: { card: Card, visible: boolean, handleClose: () => void, handleSubmit: ((card: Card) => void) }) {
  const [result, setResult] = useState<Card[] | null>(null);
  useEffect(() => {
    if (card?.oracle_id && visible) {
      setResult(null);
      getArt(card.oracle_id).then(setResult);
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
