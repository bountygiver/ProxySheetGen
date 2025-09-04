import { useState, createContext, useContext, useRef } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { Pen, Trash, CardImage } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import "./styles.css";
import ScryBox from "./components/search";
import CardEditor from "./components/editor";
import PrintableCard from "./components/PrintableCard";
import ArtSelector from "./components/ArtSelector";

const CardContext = createContext();

function CardListItem({ card }) {
  const [artSelectVisible, setArtSelectVisible] = useState(false);
  const { removeCard, editCard, replaceCard } = useContext(CardContext);

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between">
        {card.name}
        <div>
          <ArtSelector
            card={card}
            visible={artSelectVisible}
            handleClose={() => setArtSelectVisible(false)}
            handleSubmit={(newCard) => {
              replaceCard(card, newCard);
            }}
          />
          <ButtonGroup>
            <Button
              variant="info"
              onClick={() => {
                editCard(card);
              }}
            >
              <Pen />
            </Button>
            <Button
              variant="info"
              onClick={() => {
                setArtSelectVisible(true);
              }}
            >
              <CardImage />
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeCard(card);
              }}
            >
              <Trash />
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </li>
  );
}

function CardsList() {
  const { cards } = useContext(CardContext);

  return (
    <>
      <ul className="list-group">
        {cards.map((c) => (
          <CardListItem key={c.internalId} card={c} />
        ))}
      </ul>
    </>
  );
}

export default function App() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState();
  const [editorVisbible, setEditorVisible] = useState();
  const cardCount = useRef(0);
  const addCard = function (card) {
    setCards([...cards, { ...card, internalId: cardCount.current++ }]);
  };
  const editCard = function (card) {
    setSelectedCard(card);
    setEditorVisible(true);
  };
  const replaceCard = function (card, newCard) {
    const index = cards.findIndex((c) => c === card);
    if (index != -1) {
      setCards(
        cards.toSpliced(index, 1, {
          ...newCard,
          internalId: cardCount.current++,
        })
      );
    }
    setEditorVisible(false);
  };
  const removeCard = function (card) {
    const index = cards.findIndex((c) => c === card);
    if (index != -1) {
      setCards(cards.toSpliced(index, 1));
    }
  };

  return (
    <div className="App">
      <CardContext.Provider
        value={{ cards, addCard, removeCard, replaceCard, editCard }}
      >
        <div className="content">
          <span>Add Cards Here</span>
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
        </div>
        <div className="printable">
          <div className="d-flex flex-wrap">
            {cards?.map((c) => (
              <PrintableCard key={c.internalId} card={c} />
            ))}
          </div>
        </div>
      </CardContext.Provider>
    </div>
  );
}
