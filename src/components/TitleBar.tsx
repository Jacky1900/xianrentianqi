import React from 'react'

interface TitleBarProps {
  onMinimize: () => void
  onClose: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onMinimize, onClose }) => {
  return (
    <div className="nokia-titlebar">
      <span style={{ fontSize: 10, opacity: 0.3, letterSpacing: 1 }}>闲人天气</span>
      <div style={{ display: 'flex', gap: 2 }}>
        <button className="nokia-titlebar-btn" onClick={onMinimize} title="最小化">
          &#xE921;
        </button>
        <button className="nokia-titlebar-btn close" onClick={onClose} title="关闭">
          &#x2715;
        </button>
      </div>
    </div>
  )
}

export default TitleBar
