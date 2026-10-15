import { splitPhrases } from "@/presentation/content/siteContent";

interface PhrasesProps {
  readonly text: string;
}

/** 文節ごとに inline-block で並べ、句読点の位置で自然に折り返させる */
export function Phrases({ text }: PhrasesProps) {
  return (
    <>
      {splitPhrases(text).map((phrase, index) => (
        <span key={`${index}-${phrase}`} data-reveal className="inline-block">
          {phrase}
        </span>
      ))}
    </>
  );
}
