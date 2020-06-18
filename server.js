const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./buildtools/webpack.dev.js');
const compiler = webpack(config);
const port = 3000;
const host = `http://localhost:${port}`


// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
  writeToDisk: true,
  watchOptions: {
    aggregateTimeout: 600,
    poll: 200
  }
}));

// Serve the files on port 3000.
app.listen(port, function () {
  console.log(`\n on port ${host}!\n`);
});
