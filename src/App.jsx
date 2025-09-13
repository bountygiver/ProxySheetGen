import { useState, createContext, useContext, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { Pen, Trash, CardImage, Eye } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import ButtonGroup from "react-bootstrap/ButtonGroup";
import "./styles.css";
import useList from "./helper/list";
import ScryBox from "./components/search";
import CardEditor from "./components/editor";
import PrintableCard from "./components/PrintableCard";
import MassEntry from "./components/MassEntry";
import ArtSelector from "./components/ArtSelector";
import Notification from "./components/Notification";
import Accordion from 'react-bootstrap/Accordion';
import ToastContainer from 'react-bootstrap/ToastContainer';

const CardContext = createContext();

function CardActions({ card }) {
  const { removeCard, editCard, selectCardArt } = useContext(CardContext);

  return (<ButtonGroup>
    <Button
      variant="info"
      title="Edit Card"
      onClick={() => {
        editCard(card);
      }}
    >
      <Pen />
    </Button>
    <Button
      variant="info"
      title="Select Card Variant"
      onClick={() => {
        selectCardArt(card);
      }}
    >
      <CardImage />
    </Button>
    <Button
      variant="success"
      title="Open in Scryfall"
      href={card?.scryfall_uri}
      target="_blank"
    >
      <Eye />
    </Button>
    <Button
      variant="danger"
      title="Remove Card"
      onClick={() => {
        removeCard(card);
      }}
    >
      <Trash />
    </Button>
  </ButtonGroup>);
}

function CardListItem({ card }) {

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between">
        {card.name}
        <div>
          <CardActions card={card} />
        </div>
      </div>
    </li>
  );
}

function CardsList() {
  const { cards } = useContext(CardContext);

  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Selected Cards</Accordion.Header>
        <Accordion.Body>
          <ul className="list-group">
            {cards.map((c) => (
              <CardListItem key={c.internalId} card={c} />
            ))}
          </ul>
          {cards?.length ? <></> : <div>No cards, why not add some?</div>}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default function App() {
  const [cards, _addCard, _removeCard, _replaceCard] = useList();
  const [notifications, addNotification, removeNotification] = useList();
  const [selectedCard, setSelectedCard] = useState();
  const [editorVisbible, setEditorVisible] = useState(false);
  const [artSelectVisible, setArtSelectVisible] = useState(false);
  const [massEntryVisible, setMassEntryVisible] = useState(false);
  const [theme, setTheme] = useState("light");
  const cardCount = useRef(0);
  const addCard = function (card) {
    const newCard = { ...card, internalId: cardCount.current++ };
    _addCard(newCard);
    addNotification({ contents: `Added card ${card.name}`, card: [newCard] });
  };
  const editCard = function (card) {
    setSelectedCard(card);
    setEditorVisible(true);
  };
  const selectCardArt = function (card) {
    setSelectedCard(card);
    setArtSelectVisible(true);
  };
  const replaceCard = function (card, newCard) {
    _replaceCard(card, { ...newCard, internalId: cardCount.current++ });
    setEditorVisible(false);
  };
  const removeCard = function (card) {
    if (confirm("Are you sure?")) {
      _removeCard(card);
    }
  };

  const setThemeOnCheckbox = function(checked) {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  useEffect(() => {
    setThemeOnCheckbox(localStorage.getItem("theme") == "dark");
  }, []);

  return (
    <div className="App">
      <CardContext.Provider
        value={{ cards, addCard, removeCard, replaceCard, editCard, selectCardArt }}
      >
        <div className="content">
          <div className="d-flex justify-content-center">
            <Form.Check id="theme-switch" type="switch" checked={theme == "dark"} label={theme == "light" ? "Light Mode" : "Dark Mode"} onChange={(e) => {
              setThemeOnCheckbox(e.target.checked);
            }} />
          </div>
          <div><span>Add Cards Here</span><Button className="m-1" variant="primary" onClick={() => setMassEntryVisible(true)}>Mass Entry</Button></div>
          <ScryBox onClick={addCard} />
          <CardsList />
          <CardEditor
            card={selectedCard}
            visible={editorVisbible}
            handleClose={() => setEditorVisible(false)}
            handleSubmit={(newCard) => {
              replaceCard(selectedCard, newCard);
              setEditorVisible(false);
            }}
          />
          <ArtSelector
            card={selectedCard}
            visible={artSelectVisible}
            handleClose={() => setArtSelectVisible(false)}
            handleSubmit={(newCard) => {
              replaceCard(selectedCard, newCard);
              setArtSelectVisible(false);
            }}
          />
          <MassEntry
            visible={massEntryVisible}
            handleClose={() => setMassEntryVisible(false)}
            handleSubmit={(newCards) => {
              const cardsToAdd = newCards.flatMap(({ card, count }) => {
                return new Array(count).fill(0).map(() => {
                  return { ...card, internalId: cardCount.current++ };
                })
              });
              _addCard(...cardsToAdd);
              addNotification({ contents: `${cardsToAdd.length} cards added!`, card: cardsToAdd, delay: 10000 })
              setMassEntryVisible(false);
            }}
          />
          <ToastContainer className="position-fixed" style={{ right: "1rem", bottom: "1rem" }}>
            {notifications.map((n, i) => (<Notification key={i} message={n.contents} delay={n.delay}>
              {n.card && <Button size="sm" onClick={() => {
                _removeCard(...n.card);
                removeNotification(n);
              }}>Undo</Button>}
            </Notification>))}
          </ToastContainer>
        </div>
        <div className="printable">
          <div className="d-flex flex-wrap">
            {cards?.map((c) => (
              <PrintableCard key={c.internalId} card={c}>
                <CardActions card={c} />
              </PrintableCard>
            ))}
          </div>
        </div>
      </CardContext.Provider>
    </div>
  );
}
