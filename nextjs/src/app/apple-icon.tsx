import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e5c87 0%, #083a58 100%)",
          borderRadius: "36px",
          position: "relative",
        }}
      >
        {/* TN monogram */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 700,
            fontSize: 76,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          TN
        </span>

        {/* Cursor underscore */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            left: "48px",
            width: "84px",
            height: "6px",
            borderRadius: "2px",
            background: "#0ea5e9",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
