import { type Cell, type Moment, type PersonId, formatTime } from "@/lib/store";

function CellBody({ cell }: { cell: Cell }) {
  const stamp = (
    <span className={`stamp ${cell.kind === "emoji" ? "stamp-dark" : ""}`}>
      {formatTime(cell.timestamp)} {cell.city}
    </span>
  );

  if (cell.kind === "emoji") {
    return (
      <div className="emoji-wrap flex h-full w-full items-center justify-center bg-background">
        <span className="emoji-cell">{cell.emoji}</span>
        {stamp}
      </div>
    );
  }

  return (
    <>
      <img
        src={cell.photoUrl}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        draggable={false}
      />
      <span className="scrim" />
      {stamp}
    </>
  );
}

type Props = {
  moment: Moment;
  perspective: PersonId;
  /** only the newest moment may carry the + and the breathing */
  isNewest?: boolean;
  onPlus?: () => void;
  pairing?: boolean;
  detail?: boolean;
};

export function Rectangle({ moment, perspective, isNewest, onPlus, pairing, detail }: Props) {
  const left = moment.initiatorCell;
  const right = moment.responderCell;
  const paired = right !== null;
  const viewerIsInitiator = moment.initiator === perspective;

  // The frame is open (split) when paired, or when the newest unpaired moment
  // is seen by the person who has not filled their cell.
  const open = paired || (!!isNewest && !viewerIsInitiator);
  const showPlus = !paired && !!isNewest && !viewerIsInitiator;

  return (
    <div className={`rect ${pairing ? "pairing" : ""} ${detail ? "detail" : ""}`}>
      {paired || isNewest ? (
        <div className="cell cell-right">
          {right ? (
            <CellBody cell={right} />
          ) : (
            <button
              type="button"
              aria-label="Add your moment"
              className="cell-empty pressable absolute inset-0"
              onClick={(e) => {
                e.stopPropagation();
                onPlus?.();
              }}
            >
              <span
                className={`plus plus-fade ${showPlus ? "breathing" : ""}`}
                style={{
                  opacity: showPlus ? 1 : 0,
                  transform: `translate(-50%, -50%) scale(${showPlus ? 1 : 0.8})`,
                }}
              />
            </button>
          )}
        </div>
      ) : null}

      <div className="cell cell-left" style={{ width: open ? "50%" : "100%" }}>
        <CellBody cell={left} />
      </div>

      <div className="divider" style={{ opacity: open ? 1 : 0 }} />
    </div>
  );
}
