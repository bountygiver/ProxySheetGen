import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const stats = function (card) {
  if (!card) return;
  return (
    card.stat_override ??
    (card.power != undefined || card.toughness != undefined
      ? `${card.power}/${card.toughness}`
      : card.loyalty ?? card.defense ?? null)
  );
};

function CardFaceEditor({ card, formId }) {
  return (
    <Form id={formId}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Card Name"
          name="name"
          defaultValue={card?.name}
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
          defaultValue={card?.oracle_text}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Stats</Form.Label>
        <Form.Control
          type="text"
          name="stat_override"
          defaultValue={stats(card)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Custom Image</Form.Label>
        <Form.Control type="file" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Artist</Form.Label>
        <Form.Control type="text" name="artist" defaultValue={card?.artist} />
      </Form.Group>
      <hr />
    </Form>
  );
}

function CreateEditorForCardFace(card, formId) {
  return {
    component: <CardFaceEditor card={card} formId={formId} />,
    callback: () => {
      const form = document.getElementById(formId);
      const formData = new FormData(form);
      const resp = {
        ...card,
        ...Object.fromEntries(
          formData.entries().map(([k, v]) => [k, v == "" ? undefined : v])
        ),
      };
      const customFile = form.querySelector("input[type=file]");
      if (customFile?.files?.length) {
        resp.override_image = URL.createObjectURL(customFile.files[0]);
      }
      return resp;
    },
  };
}

export default function ({ card, visible, handleClose, handleSubmit }) {
  const mainFace = CreateEditorForCardFace(card, "main-card-editor");
  const cardFaces = card?.card_faces
    ?.filter((f) => f.object == "card_face")
    .map((f, i) => CreateEditorForCardFace(f, `card-face-editor-${i}`));
  return (
    <Modal show={visible} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Card Editor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {(cardFaces?.length && cardFaces?.map((c) => c.component)) ||
          mainFace.component}
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
                handleSubmit(mainFace.callback());
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
