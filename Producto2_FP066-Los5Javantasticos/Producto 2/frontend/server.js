const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server-express');

// cargo configuración
const { PORT, GRAPHQL_PATH } = require('./config/config');
const { MONGODB_URI, MONGODB_OPTIONS } = require('./config/database');

// cargo controladores
const weekController = require('./controllers/weekController');
const taskController = require('./controllers/taskController');

// cargo modelos
const Week = require('./models/week');
const Task = require('./models/task');

// creo la app
const app = express();
app.use(cors());
app.use(express.json());

// conecto a la bd
mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);

// Rutas para Weeks
app.get('/weeks', weekController.getWeeks);
app.post('/weeks', weekController.createWeek);
app.put('/weeks/:id', weekController.updateWeek); 
app.delete('/weeks/:id', weekController.deleteWeek); 

// Rutas para Tasks
app.get('/tasks', taskController.getTasks);
app.post('/tasks', taskController.createTask);
app.put('/tasks/:id', taskController.updateTask); 
app.put('/tasks', taskController.updateTasks); 
app.delete('/tasks/:id', taskController.deleteTask); 

// Definición de tipos y esquemas GraphQL
const typeDefs = gql`
  type Week {
    id: ID!
    year: Int!
    numweek: Int!
    color: String!
    description: String!
    priority: Int!
    link: String!
  }

  type Task {
    id: ID!
    yearweek: String!
    dayofweek: String!
    name: String!
    description: String!
    color: String!
    time_start: String!
    time_end: String!
    finished: Int!
    priority: Int!
  }

  type Query {
    weeks: [Week!]!
    tasks: [Task!]!
  }

  type Mutation {
    createWeek(year: Int!, numweek: Int!, color: String!, description: String!, priority: Int!, link: String!): Week!
    updateWeek(id: ID!, year: Int!, numweek: Int!, color: String!, description: String!, priority: Int!, link: String!): Week!
    deleteWeek(id: ID!): Week!
    createTask(yearweek: String!, dayofweek: String!, name: String!, description: String!, color: String!, time_start: String!, time_end: String!, finished: Int!, priority: Int!): Task!
    updateTask(id: ID!, yearweek: String, dayofweek: String, name: String, description: String, color: String, time_start: String, time_end: String, finished: Int, priority: Int): Task!
    deleteTask(id: ID!): Task!
  }
`;

// Resolvers GraphQL
const resolvers = {
  Query: {
    weeks: async () => await Week.find(),
    tasks: async () => await Task.find(),
  },
  Mutation: {
    createWeek: async (_, args) => {
      const newWeek = new Week(args);
      await newWeek.save();
      return newWeek;
    },
    updateWeek: async (_, { id, ...args }) => {
      const updatedWeek = await Week.findByIdAndUpdate(id, args, { new: true });
      return updatedWeek;
    },
    deleteWeek: async (_, { id }) => {
      const deletedWeek = await Week.findByIdAndDelete(id);
      return deletedWeek;
    },
    createTask: async (_, args) => {
      const newTask = new Task(args);
      await newTask.save();
      return newTask;
    },
    updateTask: async (_, { id, ...args }) => {
      const updatedTask = await Task.findByIdAndUpdate(id, args, { new: true });
      return updatedTask;
    },
    deleteTask: async (_, { id }) => {
      const deletedTask = await Task.findByIdAndDelete(id);
      return deletedTask;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// Añade esta función para iniciar el servidor
async function start() {
    await server.start();
    server.applyMiddleware({ app, path: GRAPHQL_PATH });
  
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
  
  // Llama a la función start
  start();