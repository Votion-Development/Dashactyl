import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Router from './Router';

export function render() {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Router />
    </React.StrictMode>
  )
  return { html }
}