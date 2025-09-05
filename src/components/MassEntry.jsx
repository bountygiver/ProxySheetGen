import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { useRef, useState } from "react";

const fetchByNames = function (cardNames) {
  return fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    body: JSON.stringify({
      "identifiers": Object.keys(cardNames).map((c) => { return { name: c }; })
    }),
    headers: {
      "Content-Type": "application/json",
    }
  })
    .then((r) => r.json())
    .then((d) => {
      return {
        not_found: d.not_found,
        data: d.data.map((c) => {
          return {
            card: c,
            count: cardNames[c.name]
          }
        })
      };
    });
}

const fetchBySet = function ([_, count, __, set, code]) {
  return fetch(`https://api.scryfall.com/cards/${set}/${code}`)
    .then((r) => r.json())
    .then((d) => {
      return {
        data: [
          {
            card: d,
            count: parseInt(count) || 1
          }
        ]
      }
    })
    .catch(() => {
      return Promise.resolve({ "not_found": [`${set} ${code}`] })
    });
}

const fetchCards = function ([nameMatches, setMatches]) {
  const names = Object.entries(nameMatches);
  if (!names.length && !setMatches.length) return Promise.resolve({});
  const nameRequests = [];

  for (let i = 0; i < names.length; i = i + 75) {
    nameRequests.push(fetchByNames(Object.fromEntries(names.slice(i, i + 75))));
  }

  nameRequests.push(...setMatches.map(fetchBySet));

  return Promise.all(nameRequests).then((results) => {
    return results.reduce(({ data, not_found }, c) => {
      return {
        data: [...data, ...(c.data ?? [])],
        not_found: [...not_found, ...(c.not_found ?? [])]
      }
    }, { data: [], not_found: [] })
  })
}

const processUserEntry = function (input) {
  const matches = Array.from(input?.matchAll(/^(?!\/\/)(?:(\d*)[ ])?([^\(\r\n]+)(?<![\s])(?: \(([\w\d]{3,})\) (.+))?/gm) ?? []);

  const fixSplitCards = function (inText) {
    return inText?.replace(/(.+)(\b\s?[\/]+\s?\b)(.+)/gm, "$1 // $3");
  }

  const hasSetCode = ([_, __, ___, set, code]) => set != null && code != null;

  const nameOnlyMatches = matches.filter((f) => !hasSetCode(f));
  const setCodeMatches = matches.filter((f) => hasSetCode(f));

  return [nameOnlyMatches.reduce((cards, [_, num, cardName]) => {
    return {
      ...cards,
      [fixSplitCards(cardName)]: (cards[fixSplitCards(cardName)] || 0) + (parseInt(num) || 1)
    };
  }, {}), setCodeMatches];
}

export default function ({ visible, handleClose, handleSubmit }) {
  const textRef = useRef();
  const [adding, setAdding] = useState(false);
  return (
    <Modal show={visible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Mass Entry</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {adding && <Spinner animation="border" className="mx-auto" /> || <Form>
          <Form.Group className="mb-3">
            <Form.Label>Paste list of cards here</Form.Label>
            <Form.Control
              ref={textRef}
              as="textarea"
              rows={20}
              name="cards"
              placeholder="3 Island
1 Sol Ring
1 Command Tower
..."
            />
          </Form.Group>
        </Form>}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} variant="secondary">
          Close
        </Button>
        <Button
          variant="primary"
          disabled={adding}
          onClick={() => {
            if (handleSubmit) {
              setAdding(true);
              fetchCards(processUserEntry(textRef.current.value)).then((fetchedCards) => {
                if (fetchedCards.not_found?.length) {
                  alert(`${fetchedCards.not_found.length} cards not found! ${fetchedCards.not_found.map((c) => c.name).join()}`);
                }
                handleSubmit(fetchedCards.data ?? []);
              })
                .catch((e) => {
                  alert(e);
                })
                .finally(() => {
                  setAdding(false);
                });
            }
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
