import React, { useEffect, useState } from 'react';
import './TaraLoader.css';

export default function TaraLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // You can also change the 1200 here if your new video is longer or shorter
    const t = setTimeout(() => setVisible(false), 5000); 
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="tara-overlay">
      <video
        className="tara-video"
        src="/images/attach-loader.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}