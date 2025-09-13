import { useManaSymbols } from "../helper/symbols";
import {default as CardColor, colorDict} from "../helper/color";

const reminderTexts = [
  "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)",
  "Fuse (You may cast one or both halves of this card from your hand.)",
];

const reminderCuller = function (s) {
  if (!s) return "";
  return reminderTexts.reduce((c, t) => c.replace(t), s).trim();
};

function ManaDisplay({ mana }) {
  const [_, manaDisplay] = useManaSymbols(mana);

  return manaDisplay;
}

function FlipHint({ card }) {
  if (!card) {
    return <></>;
  }

  const [_, hintContents] = useManaSymbols(
    card.type_line.includes("Land")
      ? card.oracle_text?.split("\n").find((f) => f.includes("{T}"))
      : card.mana_cost
  );

  return (
    <div className="flip-hint">
      <div className="fw-bold">FLIP: {card.type_line}</div>
      <div className="text-nowrap">{hintContents}</div>
    </div>
  );
}

function CardStats({ card }) {
  const stats =
    card.stat_override ??
    (card.power != undefined || card.toughness != undefined
      ? `${card.power}/${card.toughness}`
      : card.loyalty ?? card.defense ?? null);
  return stats && <div className="stats">{stats}</div>;
}

function CardReminder({ card }) {
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

function CardData({ card, append }) {
  const [__, oracle] = useManaSymbols(card?.oracle_text);

  const className = function (s) {
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
            <div>{card.color_indicator?.map((c) => (<span className="card-color-indicator" style={{color: colorDict[c]}}>&#9210; </span>))}<span>{card.type_line}</span></div>
          </div>
        </div>
        <div className={className("oracle")}>{oracle}</div>
      </>
    )
  );
}

export default function PrintableCard(props) {
  const card = { ...props.card };
  if (card.layout == "adventure" || card.layout == "split") {
    card.split = {
      name: card.card_faces[1]?.name,
      printed_name: card.card_faces[1]?.printed_name,
      type_line: card.card_faces[1]?.type_line,
      mana_cost: card.card_faces[1]?.mana_cost,
      colors:
        card.card_faces[1]?.colors ?? card.card_faces[1]?.mana_cost?.split(""),
      oracle_text: reminderCuller(card.card_faces[1]?.oracle_text),
    };
    card.name = card.card_faces[0]?.name;
    card.printed_name = card.card_faces[0]?.printed_name;
    card.mana_cost = card.card_faces[0]?.mana_cost;
    card.type_line = card.card_faces[0]?.type_line;
    card.oracle_text = reminderCuller(card.card_faces[0]?.oracle_text);
    if (card.keywords?.includes("Fuse")) {
      card.reminder = "Fuse";
      card.reminder_desc =
        "(You may cast one or both halves of this card from your hand.)";
    }
  }
  if (card.type_line?.split(" ").includes("Room")) {
    card.reminder = "";
    card.reminder_desc =
      "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)";
  }

  const faces = card.card_faces?.filter((c) => c.object == "card_face");

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
  } else if (card.layout == "flip") {
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
    ...card.type_line
      ?.split(" ")
      .filter((s) => s.match(/^\w+$/))
      .map((s) => `card-type-${s.toLowerCase()}`),
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
          <CardData card={card.split} append={[2]} />
          <div className="footer">
            <FlipHint card={card.flip} />
            <CardReminder card={card} />
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
