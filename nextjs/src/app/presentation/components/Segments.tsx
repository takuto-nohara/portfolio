interface SegmentsProps {
  readonly items: readonly string[];
}

/** 「A / B / C」を区切りの直後でだけ折り返すように並べる（狭い画面で語の途中で切れないようにする） */
export function Segments({ items }: SegmentsProps) {
  return (
    <>
      {items.map((item, index) => (
        <span key={`${index}-${item}`}>
          <span className="inline-block">
            {item}
            {index < items.length - 1 ? " /" : null}
          </span>
          {index < items.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
