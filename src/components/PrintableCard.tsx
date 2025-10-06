import { useManaSymbols } from "../helper/symbols";
import { default as CardColor, colorDict } from "../helper/color";
import { SelectedCard, EditableCardFace } from "../models/card"

type DisplayCard = SelectedCard & {
  split?: EditableCardFace,
  flip?: EditableCardFace,
  reminder?: string,
  reminder_desc?: string,
}

const reminderTexts = [
  "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)",
  "Fuse (You may cast one or both halves of this card from your hand.)",
];

const reminderCuller = function (s: string) {
  if (!s) return "";
  return reminderTexts.reduce((c, t) => c.replace(t, ""), s).trim();
};

function ManaDisplay({ mana }: { mana: string }) {
  const [_, manaDisplay] = useManaSymbols(mana);

  return manaDisplay;
}

function FlipHint({ card }: { card?: EditableCardFace }) {
  if (!card) {
    return <></>;
  }

  const [_, hintContents] = useManaSymbols(
    card.type_line?.includes("Land") &&
    card.oracle_text?.split("\n").find((f) => f.includes("{T}")) ||
    card.mana_cost
  );

  return (
    <div className="flip-hint">
      <div className="fw-bold">FLIP: {card.type_line}</div>
      <div className="text-nowrap">{hintContents}</div>
    </div>
  );
}

function CardStats({ card }: { card: EditableCardFace }) {
  const stats =
    card.stat_override ??
    (card.power != undefined || card.toughness != undefined
      ? `${card.power}/${card.toughness}`
      : card.loyalty ?? card.defense ?? null);
  return stats && <div className="stats">{stats}</div>;
}

function CardReminder({ card }: { card: DisplayCard }) {
  return (
    (card.reminder || card.reminder_desc) && (
      <div className="card-reminder">
        <span>{card.reminder}</span>
        <span> </span>
        <i>{card.reminder_desc}</i>
      </div>
    )
  );
}

function CardData({ card, append }: { card: EditableCardFace, append?: string[] }) {
  const [__, oracle] = useManaSymbols(card?.oracle_text);

  const className = function (s: string) {
    return [s, ...(append?.map((a) => `${s}-${a}`) ?? [])].join(" ");
  };

  return (
    card && (
      <>
        <div className={className("name")}>
          <div>{card.printed_name || card.name}</div>
          <div className={className("mana")}>
            <ManaDisplay mana={card.mana_cost} />
          </div>
        </div>
        <div className={className("type")}>
          <div
            className="type-contents"
            style={{ background: CardColor(card) }}
          >
            <div>{card.color_indicator?.map((c) => (<span className="card-color-indicator" style={{ color: colorDict[c] }}>&#9210; </span>))}<span>{card.type_line}</span></div>
          </div>
        </div>
        <div className={className("oracle")}>{oracle}</div>
      </>
    )
  );
}

export default function PrintableCard(props: { children?: any, card: DisplayCard | EditableCardFace }) {
  const card = { ...props.card };
  const fullCard = card as DisplayCard;
  if ((fullCard.layout == "adventure" || fullCard.layout == "split") && fullCard.card_faces) {
    fullCard.split = {
      name: fullCard.card_faces[1]?.name,
      printed_name: fullCard.card_faces[1]?.printed_name,
      type_line: fullCard.card_faces[1]?.type_line,
      mana_cost: fullCard.card_faces[1]?.mana_cost,
      object: "card_face",
      colors:
        fullCard.card_faces[1]?.colors ?? fullCard.card_faces[1]?.mana_cost?.split(""),
      oracle_text: reminderCuller(fullCard.card_faces[1]?.oracle_text),
    };
    fullCard.name = fullCard.card_faces[0]?.name;
    fullCard.printed_name = fullCard.card_faces[0]?.printed_name;
    fullCard.mana_cost = fullCard.card_faces[0]?.mana_cost;
    fullCard.type_line = fullCard.card_faces[0]?.type_line;
    fullCard.oracle_text = reminderCuller(fullCard.card_faces[0]?.oracle_text);
    if (fullCard.keywords?.includes("Fuse")) {
      fullCard.reminder = "Fuse";
      fullCard.reminder_desc =
        "(You may cast one or both halves of this card from your hand.)";
    }
  }
  if (fullCard.type_line?.split(" ").includes("Room")) {
    fullCard.reminder = "";
    fullCard.reminder_desc =
      "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)";
  }

  const faces = fullCard.card_faces?.filter((c) => c.object == "card_face");

  if (card.layout == "modal_dfc" && faces?.length == 2) {
    return (
      <>
        <PrintableCard key="frontFace" card={{ ...faces[0], flip: faces[1] }}>
          {props.children}
        </PrintableCard>
        <PrintableCard
          key="backFace"
          card={{
            ...faces[1],
            name: `[BACK] ${faces[1].name}`,
            printed_name: faces[1].printed_name && `[BACK] ${faces[1].printed_name}`,
            flip: faces[0],
          }}
        />
      </>
    );
  } else if (!card.image_uris && faces?.length) {
    return faces.map((f, i) => (
      <PrintableCard
        key={`face${i}`}
        card={{
          ...f,
          reminder: i ? `(Transformed from ${faces[0].printed_name || faces[0].name})` : "",
        }}
      >
        {i == 0 && props.children}
      </PrintableCard>
    ));
  } else if (card.layout == "flip" && faces) {
    return faces.map((f, i) => (
      <PrintableCard
        key={`face${i}`}
        card={{
          ...f,
          image_uris: card.image_uris,
          layout: i ? "flipped" : "unflipped",
          colors: card.colors,
          reminder: i ? `(Flipped of ${faces[0].printed_name || faces[0].name})` : "",
        }}
      >
        {i == 0 && props.children}
      </PrintableCard>
    ));
  }

  const cardContentClasses = [
    "card-print",
    ...(card.type_line
      ?.split(" ")
      .filter((s) => s.match(/^\w+$/))
      .map((s) => `card-type-${s.toLowerCase()}`) ?? []),
    `card-layout-${card.layout}`,
  ].join(" ");

  return (
    <div className="card-space">
      <div className={cardContentClasses}>
        <div className="card-contents" style={{ background: CardColor(card) }}>
          <div className="img">
            <img src={card.override_image || card.image_uris?.art_crop} />
          </div>
          <CardData card={card} />
          {fullCard.split && <CardData card={fullCard.split} append={["2"]} />}
          <div className="footer">
            <FlipHint card={(card as DisplayCard).flip} />
            <CardReminder card={fullCard} />
            <div className="artist">&copy; {card.artist}</div>
            <CardStats card={card} />
          </div>
        </div>
      </div>
      <div className="dont-print toolbar">
        {props.children}
      </div>
    </div>
  );
}
