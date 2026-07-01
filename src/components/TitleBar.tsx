import React from 'react'

interface TitleBarProps {
  onMinimize: () => void
  onClose: () => void
  onCollapse: () => void
  onRefresh: () => void
}

const TitleBar: React.FC<TitleBarProps> = ({ onMinimize, onClose, onCollapse, onRefresh }) => {
  return (
    <div className="nokia-titlebar">
      <span></span>
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
        {/* 刷新按钮 */}
        <button
          className="nokia-titlebar-btn"
          onClick={onRefresh}
          title="刷新"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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
