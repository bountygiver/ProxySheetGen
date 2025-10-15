import { useState, createContext, useContext, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { Pen, Trash, CardImage, Eye, EyeSlash, Globe2, ArrowDownUp } from "react-bootstrap-icons";
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
import { Card, SelectedCard } from "./models/card";

type CardActionsType = {
  cards: SelectedCard[],
  addCard: (card: Card) => void,
  replaceCard: (oldCard: SelectedCard, newCard: Card) => void,
  removeCard: (card: SelectedCard) => void,
  editCard: (card: SelectedCard) => void,
  selectCardArt: (card: SelectedCard) => void,
  toggleHidden: (card: SelectedCard) => void,
  moveCard: (oldIdx: number | null, newIdx: number | null) => void,
}

type NotificationType = {
  contents: string,
  card: SelectedCard[],
  delay?: number
}

const CardContext = createContext<CardActionsType>({
  cards: [],
  addCard: () => { },
  replaceCard: () => { },
  removeCard: () => { },
  editCard: () => { },
  selectCardArt: () => { },
  toggleHidden: () => { },
  moveCard: () => { },
});

function CardActions({ card }: { card: SelectedCard }) {
  const { removeCard, editCard, selectCardArt, toggleHidden } = useContext(CardContext);

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
    {card.hide ? <Button
      variant="warning"
      title="Unhide"
      onClick={() => {
        toggleHidden(card);
      }}
    >
      <Eye />
    </Button> : <Button
      variant="warning"
      title="Hide"
      onClick={() => {
        toggleHidden(card);
      }}
    >
      <EyeSlash />
    </Button>}
    <Button
      variant="success"
      title="Open in Scryfall"
      href={card?.scryfall_uri}
      target="_blank"
    >
      <Globe2 />
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

function CardListItem({ card, children, ...props }: { card: SelectedCard } & React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) {

  return (
    <li className="list-group-item" {...props}>
      <div className="d-flex justify-content-between">
        <div>
          {children}
          {card.name}
        </div>
        <div>
          <CardActions card={card} />
        </div>
      </div>
    </li>
  );
}

function CardsList() {
  const { cards, moveCard } = useContext(CardContext);
  const draggingPos = useRef<number | null>(null);

  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Selected Cards</Accordion.Header>
        <Accordion.Body>
          <ul className="list-group">
            {cards?.map((c) => (
              <CardListItem key={c.internalId} card={c}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  moveCard(draggingPos.current, c.internalId);
                  draggingPos.current = null;
                }}
              >
                <span
                  className="me-1"
                  role="button"
                  draggable
                  onDragStart={(e) => { 
                    draggingPos.current = c.internalId;
                    const parent = e.currentTarget?.parentElement?.parentElement;
                    if (parent) {
                      e.dataTransfer.setDragImage(parent, 0, 0);
                    }
                   }}
                  onDragEnd={() => { draggingPos.current = null; }}
                >
                  <ArrowDownUp></ArrowDownUp>
                </span>
              </CardListItem>
            ))}
          </ul>
          {cards?.length ? <></> : <div>No cards, why not add some?</div>}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default function App() {
  const [cards, _addCard, _removeCard, _replaceCard, setCards] = useList<SelectedCard>();
  const [notifications, addNotification, removeNotification] = useList<NotificationType>();
  const [selectedCard, setSelectedCard] = useState<SelectedCard>();
  const [editorVisbible, setEditorVisible] = useState(false);
  const [artSelectVisible, setArtSelectVisible] = useState(false);
  const [massEntryVisible, setMassEntryVisible] = useState(false);
  const [theme, setTheme] = useState("light");
  const cardCount = useRef(0);
  const addCard = function (card: Card) {
    const newCard = { ...card, hide: false, internalId: cardCount.current++ };
    _addCard(newCard);
    addNotification({ contents: `Added card ${card.name}`, card: [newCard] });
  };
  const editCard = function (card: SelectedCard) {
    setSelectedCard(card);
    setEditorVisible(true);
  };
  const selectCardArt = function (card: SelectedCard) {
    setSelectedCard(card);
    setArtSelectVisible(true);
  };
  const replaceCard = function (card: SelectedCard, newCard: Card) {
    _replaceCard(card, { ...newCard, hide: card.hide, internalId: cardCount.current++ });
    setEditorVisible(false);
  };
  const removeCard = function (card: SelectedCard) {
    if (confirm("Are you sure?")) {
      _removeCard(card);
    }
  };
  const toggleHidden = function (card: SelectedCard) {
    _replaceCard(card, { ...card, hide: !card.hide });
  }

  const moveCard = function (oldIdx: number | null, newIdx: number | null) {
    setCards((cards) => {
      const sourceIndex = cards.findIndex((c) => c.internalId == oldIdx);
      const targetIndex = cards.findIndex((c) => c.internalId == newIdx);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const delList = Array.from(cards);
        const [reAdd] = delList.splice(sourceIndex, 1);
        return delList.toSpliced(targetIndex, 0, reAdd);
      }

      return cards;
    });
  }

  const setThemeOnCheckbox = function (checked: boolean) {
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
        value={{ cards, addCard, removeCard, replaceCard, editCard, selectCardArt, toggleHidden, moveCard }}
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
            card={selectedCard as SelectedCard}
            visible={editorVisbible}
            handleClose={() => setEditorVisible(false)}
            handleSubmit={(newCard) => {
              replaceCard(selectedCard as SelectedCard, newCard);
              setEditorVisible(false);
            }}
          />
          <ArtSelector
            card={selectedCard as SelectedCard}
            visible={artSelectVisible}
            handleClose={() => setArtSelectVisible(false)}
            handleSubmit={(newCard) => {
              replaceCard(selectedCard as SelectedCard, newCard);
              setArtSelectVisible(false);
            }}
          />
          <MassEntry
            visible={massEntryVisible}
            handleClose={() => setMassEntryVisible(false)}
            handleSubmit={(newCards) => {
              const cardsToAdd = newCards.flatMap(({ card, count }) => {
                return new Array(count).fill(0).map(() => {
                  return { ...card, hide: false, internalId: cardCount.current++ };
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
