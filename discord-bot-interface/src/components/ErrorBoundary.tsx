/** @format */

import React, { Component } from 'react';

export default class ErrorBoundary extends Component<
	{},
	{ hasError: boolean }
> {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
		};
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.log(errorInfo.toString());
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <h3>Something went wrong.</h3>;
		}
		return this.props.children;
	}
}
