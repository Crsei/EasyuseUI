import styles from "../site.module.css"
export function ComponentThumbnail({ slug }: { slug: string }) {
  const canvas = /canvas|workflow|node|edge|port/.test(slug),
    board = /board|work-items/.test(slug),
    button = /button|input|select|dialog/.test(slug),
    status = /status|badge|tag/.test(slug)
  return (
    <div className={styles.thumbnail} aria-hidden="true">
      <svg
        viewBox="0 0 240 128"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="24" y="20" width="192" height="88" rx="6" opacity=".2" />
        {canvas ? (
          <>
            <path d="M80 52H112V76H152" opacity=".5" />
            <rect
              x="40"
              y="36"
              width="52"
              height="28"
              rx="4"
              fill="var(--background)"
            />
            <rect
              x="148"
              y="62"
              width="52"
              height="28"
              rx="4"
              fill="var(--background)"
            />
            <circle cx="68" cy="50" r="4" fill="var(--primary)" stroke="none" />
          </>
        ) : board ? (
          <>
            {[36, 94, 152].map((x, index) => (
              <g key={x}>
                <rect
                  x={x}
                  y="36"
                  width="48"
                  height="8"
                  rx="3"
                  fill="currentColor"
                  stroke="none"
                  opacity=".2"
                />
                {Array.from({ length: index === 1 ? 1 : 2 }, (_, i) => (
                  <rect
                    key={i}
                    x={x}
                    y={52 + i * 22}
                    width="48"
                    height="16"
                    rx="3"
                    opacity=".4"
                  />
                ))}
              </g>
            ))}
          </>
        ) : button ? (
          <>
            <rect
              x="52"
              y="48"
              width="76"
              height="32"
              rx="6"
              fill="var(--primary)"
              stroke="none"
            />
            <path d="M72 64H108" stroke="var(--primary-foreground)" />
            <rect x="140" y="48" width="48" height="32" rx="6" opacity=".4" />
          </>
        ) : status ? (
          <>
            {[54, 104, 154].map((x, i) => (
              <g key={x}>
                <rect
                  x={x}
                  y="52"
                  width="32"
                  height="24"
                  rx="12"
                  opacity=".3"
                />
                <circle
                  cx={x + 16}
                  cy="64"
                  r="4"
                  fill={i === 1 ? "var(--status-info)" : "currentColor"}
                  stroke="none"
                />
              </g>
            ))}
          </>
        ) : (
          <>
            {[40, 62, 84].map((y, i) => (
              <g key={y}>
                <circle cx="44" cy={y} r="4" opacity=".4" />
                <path d={`M60 ${y}H${i === 1 ? 164 : 190}`} opacity=".5" />
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  )
}
