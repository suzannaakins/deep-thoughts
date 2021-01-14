const express = require('express');
//import ApolloServer
const { ApolloServer } = require('apollo-server-express');

//import path module to serve up React front-end code in production
const path = require('path');

//import typeDefs + resolvers
const { typeDefs, resolvers } = require('./schemas');

//import authorization middleware function
const { authMiddleware } = require('./utils/auth')

const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

//create new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

//integrate Apollo server w/ Express application as middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Serve up static assets (front end code)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    // log where we can go to test our GQL API
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
