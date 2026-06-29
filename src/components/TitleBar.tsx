import React from 'react'

interface TitleBarProps {
  onMinimize: () => void
  onClose: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onMinimize, onClose }) => {
  return (
    <div className="titlebar">
      <span style={{ fontSize: 12, color: '#888' }}>闲人天气</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="titlebar-btn" onClick={onMinimize} title="最小化">
          ─
        </button>
        <button className="titlebar-btn close" onClick={onClose} title="关闭">
          ✕
        </button>
      </div>
    </div>
  )
}

export default TitleBar
