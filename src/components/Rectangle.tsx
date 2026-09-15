import { type Cell, type Moment, type PersonId, formatTime } from "@/lib/store";

function Stamp({ cell }: { cell: Cell }) {
  return (
    <span className="stamp">
      {formatTime(cell.timestamp)} {cell.city}
    </span>
  );
}

function CellView({ cell }: { cell: Cell }) {
  if (cell.kind === "emoji") {
    return (
      <div className="emoji-wrap flex h-full w-full items-center justify-center bg-background">
        <span className="emoji-cell">{cell.emoji}</span>
      </div>
    );
  }
  return (
    <img
      src={cell.photoUrl}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover"
      draggable={false}
    />
  );
}

type Props = {
  moment: Moment;
  perspective: PersonId;
  /** show the empty + cell (newest moment only, receiver only) */
  showPlus?: boolean;
  onPlus?: () => void;
  animatePair?: boolean;
};

export function Rectangle({ moment, perspective, showPlus, onPlus, animatePair }: Props) {
  const left = moment.initiatorCell;
  const right = moment.responderCell;
  const receiver = moment.initiator !== perspective;
  const split = right !== null || (showPlus && receiver);

  if (!split) {
    return (
      <div className="relative w-full border-2 border-foreground" style={{ aspectRatio: "2 / 1" }}>
        <CellView cell={left} />
        <Stamp cell={left} />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border-2 border-foreground ${animatePair ? "pairing" : ""}`}
      style={{ aspectRatio: "2 / 1" }}
    >
      <div className="pair-left absolute bottom-0 left-0 top-0 w-1/2 overflow-hidden">
        <CellView cell={left} />
        <Stamp cell={left} />
      </div>

      {right ? (
        <div className="pair-right absolute bottom-0 right-0 top-0 w-1/2 overflow-hidden">
          <CellView cell={right} />
          <Stamp cell={right} />
        </div>
      ) : (
        <button
          type="button"
          onClick={onPlus}
          aria-label="Add your moment"
          className="breathing absolute bottom-0 right-0 top-0 w-1/2 bg-background"
        >
          <span className="plus" />
        </button>
      )}

      <span className="pair-divider absolute bottom-0 left-1/2 top-0 -ml-px w-0.5 bg-foreground" />
    </div>
  );
}
