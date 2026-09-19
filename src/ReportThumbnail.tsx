import type { SceneKind } from "./scenarios";
export default function ReportThumbnail({ kind }: { kind: SceneKind }) {
  const style = { fill: "#adc3bd", stroke: "#718e8d", strokeWidth: 2 };
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <ellipse cx="80" cy="93" rx="62" ry="9" fill="#34505d12" />
      {kind === "fuel" ? (
        <>
          <path d="M24 42h29v48H24z" fill="#ae8567" />
          <path d="M28 48h20v13H28z" fill="#dbe2cd" />
          <path d="M68 65h62v24H68zm11-19h34l12 22H71z" fill="#8fb2ae" />
          <circle cx="81" cy="91" r="8" fill="#617985" />
          <circle cx="119" cy="91" r="8" fill="#617985" />
          <path
            d="M53 50q17 0 8 26h9"
            fill="none"
            stroke="#7a8b83"
            strokeWidth="4"
          />
        </>
      ) : kind === "rail" ? (
        <>
          <path d="M18 85h124M18 97h124" stroke="#8e9d99" strokeWidth="3" />
          {[25, 64, 103].map((x) => (
            <g key={x}>
              <rect x={x} y="45" width="34" height="36" rx="3" fill="#9ab5ba" />
              <rect x={x + 5} y="51" width="24" height="13" fill="#eadbb9" />
              <circle cx={x + 8} cy="84" r="5" fill="#677d87" />
              <circle cx={x + 27} cy="84" r="5" fill="#677d87" />
            </g>
          ))}
        </>
      ) : kind === "policy" ? (
        <>
          <path d="M25 39L80 15l55 24zM22 90h116v9H22z" fill="#c6b595" />
          {[38, 76, 113].map((x) => (
            <path key={x} d={"M" + x + " 43h10v44h-10z"} fill="#daceb6" />
          ))}
          <path d="M89 47h38v48H89z" fill="#f7f0dc" />
          <path
            d="M97 58h21m-21 12h21m-21 12h15"
            stroke="#98a69a"
            strokeWidth="3"
          />
        </>
      ) : kind === "signal" ? (
        <>
          <path d="M41 47h79v41H41z" fill="#9bb4b5" />
          <path d="M51 55h58v22H51z" fill="#d7dac1" />
          <circle cx="80" cy="30" r="8" fill="#b99865" />
          <path
            d="M56 20q-10 14 0 27m48-27q10 14 0 27M44 10q-18 24 0 46m72-46q18 24 0 46"
            fill="none"
            stroke="#bca57b"
            strokeWidth="3"
          />
        </>
      ) : kind === "crops" ? (
        <>
          {[43, 81, 120].map((x, i) => (
            <g key={x}>
              <path
                d={"M" + x + " 90V" + (35 + i * 8)}
                stroke="#a28c6c"
                strokeWidth="7"
              />
              <path
                d={"M" + x + " " + (28 + i * 8) + "l-23 30h46z"}
                fill="#90aa7d"
              />
              <circle cx={x + 4} cy={44 + i * 8} r="6" fill="#d4b876" />
            </g>
          ))}
        </>
      ) : (
        <>
          <rect x="28" y="40" width="39" height="54" {...style} />
          <rect x="77" y="20" width="40" height="74" fill="#c3b18f" />
          {[38, 55, 72].map((y) => (
            <path
              key={y}
              d={"M85 " + y + "h8m9 0h8"}
              stroke="#e8ddc3"
              strokeWidth="6"
            />
          ))}
          <path
            d="M130 90V15h-45"
            stroke="#b69264"
            strokeWidth="4"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
