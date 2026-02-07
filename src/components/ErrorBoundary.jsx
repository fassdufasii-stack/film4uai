import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error: error.message };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Discovery Engine Failure:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="app flex-center" style={{ height: '100vh', flexDirection: 'column', background: '#000', color: 'white', padding: '2rem', textAlign: 'center' }}>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 900 }}>System Anomaly</h1>
                    <p style={{ marginTop: '1rem', opacity: 0.8, color: '#ff4444', fontFamily: 'monospace' }}>Error: {this.state.error}</p>
                    <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>The cinematic AI has encountered a temporal paradox.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '1rem 2rem',
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            borderRadius: '100px',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Re-initiate Discovery
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
