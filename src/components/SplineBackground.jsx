import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

class SplineErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="spline-placeholder premium-gradient-fallback"></div>;
    return this.props.children;
  }
}

const SplineBackground = () => {
  return (
    <div className="spline-outer-container">
      <div className="spline-inner-container">
        {/* <SplineErrorBoundary>
          <Suspense fallback={<div className="skeleton-hero"></div>}>
            <Spline scene="https://prod.spline.design/6Wq1Q7nUCisqjSAt/scene.splinecode" />
          </Suspense>
        </SplineErrorBoundary> */}
        <div className="spline-placeholder premium-gradient-fallback"></div>
      </div>
      <div className="spline-overlay"></div>

    </div>
  );
};

export default SplineBackground;
