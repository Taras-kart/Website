import React from 'react';
import './TaraLoader.css';

export default function TaraLoader() {
  return (
    <div className="tara-overlay">
      <video
        className="tara-video"
        src="/images/logo.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/*<svg height="0" width="0" viewBox="0 0 64 64" className="tara-abs">
        <defs xmlns="http://www.w3.org/2000/svg">
          <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="tara-b">
            <stop stopColor="#FFD36A"></stop>
            <stop stopColor="#FFFFFF" offset="1"></stop>
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="tara-c">
            <stop stopColor="#FFD36A"></stop>
            <stop stopColor="#FFFFFF" offset="1"></stop>
            <animateTransform
              repeatCount="indefinite"
              keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
              keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
              dur="8s"
              values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
              type="rotate"
              attributeName="gradientTransform"
            />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="tara-d">
            <stop stopColor="#FFFFFF"></stop>
            <stop stopColor="#FFD36A" offset="1"></stop>
          </linearGradient>
        </defs>
      </svg> */}

      {/*<div className="tara-loader">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="tara-inline">
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="10"
            stroke="url(#tara-c)"
            d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54"
            className="tara-spin tara-dashspin"
            pathLength="360"
          />
        </svg>

        <div className="tara-gap" />

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 140" height="90" width="320" className="tara-inline">
          <text x="10" y="100" className="tara-word" textRendering="geometricPrecision"></text>
        </svg>

        <div className="tara-gap" />

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="tara-inline">
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#tara-d)"
            d="M 10,54 C 18,40 46,40 54,54 M 10,10 L 10,44 M 54,10 L 54,44"
            className="tara-dash"
            pathLength="360"
          />
        </svg>
      </div> */}
    </div>
  );
}
