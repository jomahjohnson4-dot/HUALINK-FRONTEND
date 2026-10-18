import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
    >
      {/* HL Logo Mark - clean icon directly on transparent background (no outer container or ring) */}
      <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"
            stroke="#E50914"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-60"
          />
          <path
            d="M2 12C2 17.523 6.477 22 12 22s10-4.477 10-10-4.477-10-10-10S2 6.477 2 12Z"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-40"
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          <span className="text-[#E50914] italic font-black text-lg">H</span>
          <span className="text-[#111111] italic font-black text-lg -ml-0.5">L</span>
        </div>
      </div>

      {/* Right Typography */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="font-black italic text-xl tracking-wider">
            <span className="text-[#E50914]">HUA</span>
            <span className="text-[#111111]">LINK</span>
          </span>
        </div>
        <span className="text-[9px] text-gray-800 font-extrabold tracking-[0.25em] uppercase block -mt-1">
          DISTRIBUTION
        </span>
      </div>
    </Link>
  );
}
