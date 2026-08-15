import { Link } from "wouter";

type TarotPreviewSectionProps = {
  ctaHref?: string;
};

export default function TarotPreviewSection({
  ctaHref = "/tarot/ai",
}: TarotPreviewSectionProps) {
  return (
    <section className="night-sky-section relative overflow-hidden py-24 px-6 md:px-10">
      <div className="night-stardust" aria-hidden="true" />
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-[#D1BE9B]/[0.08] blur-3xl pointer-events-none" />

      <span className="night-star text-[10px]" style={{ top: "14%", left: "8%" }}>
        ✦
      </span>
      <span
        className="night-star text-[8px]"
        style={{ top: "70%", left: "14%", animationDelay: "-2s" }}
      >
        ✦
      </span>
      <span
        className="night-star text-[9px]"
        style={{ top: "22%", right: "10%", animationDelay: "-3.5s" }}
      >
        ✦
      </span>
      <span
        className="night-star text-[8px]"
        style={{ bottom: "16%", right: "20%", animationDelay: "-1.2s" }}
      >
        ✦
      </span>

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span
              className="text-[15px] tracking-[0.06em] text-[#A38D6B] italic"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontWeight: 400,
              }}
            >
              Tarot Reading
            </span>
            <h2
              className="text-lg md:text-xl tracking-[0.18em] font-extralight text-[#F2EDE6] mt-2 mb-4"
              style={{
                fontFamily: "Noto Serif TC, serif",
                fontWeight: 200,
              }}
            >
              塔羅牌占卜
            </h2>
            <p
              className="text-[12px] leading-[2.1] text-[#F2EDE6]/64 tracking-wider mb-6 max-w-sm"
              style={{
                fontFamily: "Noto Sans TC, sans-serif",
                fontWeight: 300,
                fontSize: "12px",
              }}
            >
              採用凱爾特十字完整牌陣，十張牌從不同維度解析你的問題——
              過去的根源、現在的阻礙、潛意識的渴望，以及最終的可能結果。
            </p>
            <div className="flex gap-3 mb-8">
              {["過去", "現在", "未來", "潛意識", "建議"].map(tag => (
                <span
                  key={tag}
                  className="text-[11px] tracking-[0.15em] px-2.5 py-1 rounded-full bg-white/[0.06] text-[#EFE9DC]/75 border border-[#D1BE9B]/30 backdrop-blur-sm"
                  style={{
                    fontFamily: "Noto Serif TC, serif",
                    fontWeight: 300,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link href={ctaHref}>
              <button
                className="px-7 py-2.5 text-xs tracking-[0.25em] bg-[#D1BE9B] text-[#23263A] rounded-full shadow-[0_8px_28px_rgba(209,190,155,0.25)] hover:bg-[#E3D3AF] transition-all duration-500 active:scale-95"
                style={{
                  fontFamily: "Noto Serif TC, serif",
                  fontWeight: 300,
                }}
              >
                開始占卜
              </button>
            </Link>
          </div>

          <div
            className="mx-auto flex items-end justify-center animate-fade-in-up delay-200"
            style={{
              height: "240px",
              position: "relative",
              width: "260px",
            }}
          >
            <svg
              className="absolute -inset-10 w-[calc(100%+5rem)] h-[calc(100%+5rem)] pointer-events-none opacity-30"
              viewBox="0 0 340 320"
              fill="none"
              aria-hidden="true"
            >
              <polyline
                points="20,250 70,180 130,210 200,90 260,130 315,60"
                stroke="#D1BE9B"
                strokeWidth="0.6"
              />
              {[
                { x: 20, y: 250, r: 1.6 },
                { x: 70, y: 180, r: 2.2 },
                { x: 130, y: 210, r: 1.4 },
                { x: 200, y: 90, r: 2.6 },
                { x: 260, y: 130, r: 1.5 },
                { x: 315, y: 60, r: 2 },
              ].map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#D1BE9B" />
              ))}
              <path
                d="M200 78 L202 88 L212 90 L202 92 L200 102 L198 92 L188 90 L198 88 Z"
                fill="#E8DCC0"
              />
            </svg>

            <div
              style={{
                position: "absolute",
                left: "0px",
                bottom: "0px",
                transform: "rotate(-12deg)",
                animation: "floatCard1 4s ease-in-out infinite",
                filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.45))",
              }}
            >
              <img
                src="/tarot/18.jpg"
                alt="THE MOON"
                style={{
                  width: "80px",
                  height: "130px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1.5px solid rgba(209,190,155,0.65)",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "10px",
                transform: "translateX(-50%)",
                animation: "floatCard2 4.5s ease-in-out infinite",
                filter:
                  "drop-shadow(0 18px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(209,190,155,0.22))",
                zIndex: 2,
              }}
            >
              <img
                src="/tarot/17.jpg"
                alt="THE STAR"
                style={{
                  width: "90px",
                  height: "148px",
                  objectFit: "cover",
                  borderRadius: "9px",
                  border: "1.5px solid rgba(209,190,155,0.8)",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                right: "0px",
                bottom: "0px",
                transform: "rotate(10deg)",
                animation: "floatCard3 5s ease-in-out infinite",
                filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.45))",
              }}
            >
              <img
                src="/tarot/19.jpg"
                alt="THE SUN"
                style={{
                  width: "80px",
                  height: "130px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1.5px solid rgba(209,190,155,0.65)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
