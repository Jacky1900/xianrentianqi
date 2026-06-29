import React from 'react'

interface TitleBarProps {
  onMinimize: () => void
  onClose: () => void
  onCollapse: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onMinimize, onClose, onCollapse }) => {
  return (
    <div className="nokia-titlebar">
      <span style={{ fontSize: 10, opacity: 0.3, letterSpacing: 1 }}>闲人天气</span>
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* 收起按钮 - 恢复成小图标 */}
        <button
          className="nokia-titlebar-btn"
          onClick={onCollapse}
          title="收起为小图标"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
        <button className="nokia-titlebar-btn" onClick={onMinimize} title="最小化">
          &#x2500;
        </button>
        <button className="nokia-titlebar-btn close" onClick={onClose} title="关闭">
          &#x2715;
        </button>
      </div>
    </div>
  )
}

export default TitleBar
