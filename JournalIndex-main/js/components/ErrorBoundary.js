class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error("HealthOS Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) return <div className="p-10 text-center text-gray-500">Something went wrong. Please refresh.</div>;
        return this.props.children; 
    }
}
window.ErrorBoundary = ErrorBoundary;