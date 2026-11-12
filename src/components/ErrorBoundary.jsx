import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('LAST SIGNAL Runtime Error Caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 15, 0.95)',
            color: '#00FFAA',
            fontFamily: 'monospace',
            padding: '2rem',
            zIndex: 999999,
            overflow: 'auto',
          }}
        >
          <div style={{ color: '#FF4400', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            ⚠ LAST SIGNAL GRAPHICS ENGINE ALERT
          </div>
          <p style={{ color: '#E0E8E0', marginBottom: '1rem' }}>
            A rendering exception occurred while mounting the 3D scene:
          </p>
          <div
            style={{
              background: 'rgba(255, 68, 0, 0.1)',
              border: '1px solid #FF4400',
              padding: '1rem',
              borderRadius: '4px',
              color: '#FF8866',
              marginBottom: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error?.toString()}
          </div>
          {this.state.errorInfo?.componentStack && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid #334433',
                padding: '1rem',
                borderRadius: '4px',
                color: '#88AA88',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.errorInfo.componentStack}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.8rem 1.8rem',
              background: '#00FFAA',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            RELOAD ENGINE
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

