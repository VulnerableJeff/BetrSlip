import React from "react";

type State = { hasError: boolean; info?: string; error?: any };
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: any) { return { hasError: true, error: err }; }
  componentDidCatch(error: any, info: any) { this.setState({ info: String(info) }); console.error(error, info); }
  render() {
    if (!this.state.hasError) return this.props.children as React.ReactNode;
    return (
      <div style={{padding:16}}>
        <h2>Something went wrong</h2>
        <pre style={{whiteSpace:"pre-wrap",opacity:.7}}>{String(this.state.error || "")}</pre>
        <button onClick={()=>location.reload()}>Reload</button>
      </div>
    );
  }
}
