"use client";

import React from "react";

interface MessagingSectionErrorBoundaryProps {
  name: string;
  children: React.ReactNode;
}

interface MessagingSectionErrorBoundaryState {
  error: Error | null;
}

export class MessagingSectionErrorBoundary extends React.Component<
  MessagingSectionErrorBoundaryProps,
  MessagingSectionErrorBoundaryState
> {
  state: MessagingSectionErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): MessagingSectionErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[MessagingErrorBoundary:${this.props.name}]`, error.message, error);
    console.error(`[MessagingErrorBoundary:${this.props.name}] componentStack:`, errorInfo.componentStack);
    if (error.stack) {
      console.error(`[MessagingErrorBoundary:${this.props.name}] stack:`, error.stack);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          data-messaging-error-boundary={this.props.name}
        >
          <p className="font-semibold">{this.props.name} crashed</p>
          <p className="mt-1 text-xs">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
