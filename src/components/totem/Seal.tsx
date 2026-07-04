type SealProps = {
  size?: number;
};

export function Seal({ size = 72 }: SealProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 38%, #c0392b 0%, #9e1b13 60%, #6b0f0a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid #FFCD6E`,
        boxShadow: `0 0 0 ${Math.max(1, size * 0.02)}px rgba(255, 205, 110, 0.3), inset 0 2px 4px rgba(0,0,0,0.4)`,
      }}
    >
      <div
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 38%, #c0392b 0%, #9e1b13 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed rgba(255,205,110,0.5)",
        }}
      >
        <span
          style={{
            fontFamily: "Times-Roman, serif",
            fontSize: size * 0.3,
            color: "#FFCD6E",
            fontWeight: "bold",
            letterSpacing: 2,
          }}
        >
          TA
        </span>
      </div>
    </div>
  );
}
