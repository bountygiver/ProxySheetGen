import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useRef } from 'react';
import { Card, SelectedCard, EditableCardFace } from '../models/card';

const stats = function (card: EditableCardFace) {
  if (!card) return undefined;
  return (
    card.stat_override ??
    (card.power != undefined || card.toughness != undefined
      ? `${card.power}/${card.toughness}`
      : card.loyalty ?? card.defense ?? undefined)
  );
};

function CardFaceEditor({ card, formId, className, hideImageEditor }: { card: EditableCardFace, formId: string, className: string, hideImageEditor: boolean }) {
  const oracleFieldRef = useRef<any>(null);
  return (
    <Form className={className} id={formId}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Card Name"
          name="printed_name"
          defaultValue={card?.printed_name || card?.name}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Mana Cost</Form.Label>
        <Form.Control
          type="text"
          name="mana_cost"
          defaultValue={card?.mana_cost}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Type</Form.Label>
        <Form.Control
          type="text"
          name="type_line"
          defaultValue={card?.type_line}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Oracle Text</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="oracle_text"
          ref={oracleFieldRef}
          defaultValue={card?.oracle_text}
        />
        {
          card?.printed_text ? <Button className="m-1" onClick={() => {
            oracleFieldRef.current.value = card.printed_text;
          }}>Use Printed</Button> : <></>
        }
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Stats</Form.Label>
        <Form.Control
          type="text"
          name="stat_override"
          defaultValue={stats(card)}
        />
      </Form.Group>
      <Form.Group className="mb-3" hidden={hideImageEditor}>
        <Form.Label>Custom Image</Form.Label>
        <Form.Control type="file" />
      </Form.Group>
      <Form.Group className="mb-3" hidden={hideImageEditor}>
        <Form.Label>Artist</Form.Label>
        <Form.Control type="text" name="artist" defaultValue={card?.artist} />
      </Form.Group>
      <hr className="d-lg-none" />
    </Form>
  );
}

function CreateEditorForCardFace(card: EditableCardFace, formId: string, hideImageEditor = false) {
  return {
    component: <CardFaceEditor className="flex-grow-1" card={card} key={formId} formId={formId} hideImageEditor={hideImageEditor} />,
    callback: (): EditableCardFace => {
      const form = document.getElementById(formId) as HTMLFormElement;
      const formData = new FormData(form);
      const resp = {
        ...card,
        ...Object.fromEntries(
          Array.from(formData.entries()).map(([k, v]) => [k, v == "" ? undefined : v])
        ),
      };
      const customFile = form.querySelector("input[type=file]") as HTMLInputElement;
      if (customFile?.files?.length) {
        resp.override_image = URL.createObjectURL(customFile.files[0]);
      }
      return resp;
    },
  };
}

export default function ({ card, visible, handleClose, handleSubmit }: { card: SelectedCard, visible: boolean, handleClose: () => void, handleSubmit: (card: SelectedCard) => void }) {
  const mainFace = CreateEditorForCardFace(card, "main-card-editor");
  const cardFaces = card?.card_faces
    ?.filter((f) => f.object == "card_face")
    .map((f, i) => CreateEditorForCardFace(f, `card-face-editor-${i}`, !!(i && card?.image_uris && card.layout != "flip")));
  return (
    <Modal size="xl" show={visible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Card Editor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex flex-wrap gap-2">
          {(cardFaces?.length && cardFaces?.map((c) => c.component)) ||
            mainFace.component}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} variant="secondary">
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (handleSubmit) {
              if (cardFaces?.length) {
                const newCard = {
                  ...card,
                  card_faces: cardFaces.map((f) => f.callback()),
                };
                if (newCard.image_uris) {
                  newCard.override_image = newCard.card_faces[0].override_image;
                }
                handleSubmit(newCard);
              } else {
                handleSubmit({...card, ...mainFace.callback()});
              }
            }
          }}
        >
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
