# GraphQL, Sequelize, and an Apollo server

## Table of Contents

- [Introduction](#introduction)
- [The Database](#the-database)
  - [Configuration](#configuration)
  - [Models](#models)
  - [Migrations](#migrations)
- [The Server](#the-server)
- [Conclusion](#conclusion)
- [Additional Reading](#additional-reading)
- [Technologies](#technologies-used)
- [About the Author](#about-the-author)

## Introduction

These are the notes based off of the tutorial found https://www.digitalocean.com/community/tutorials/how-to-set-up-a-graphql-server-in-node-js-with-apollo-server-and-sequelize

So this is a fairly simple implementation of a DB with just 2 tables and a 1:n relationship. It used CLI to set things up and this was nice as it saved a lot of coding. It also used only the Apollo server (as opposed the Apollo-Express server we learned in class). The tutorial used SQLite, but I did it with MySQL. I couldn't see that there were any real differences in the coding as it was all still Sequelize.

## The Database

### Configuration

The configuration was done as part of the `models/index.js`. When running the `npx sequelize.init` it auto-generates a config directory and a `config.json` file. This file contains the connection information for the different environments. This needed updated to contain the proper information.

The author removes all of the user and password information, I don't know if this is because his DB is unsecured or if it is a function of SQLite. However for MySQL and the setup of my db, this information is required. As per the [Sequelize documentation](https://sequelize.org/master/manual/migrations.html#configuration), the Sequelize CLI assumes MySQL by default. So the only things I need to change here are the username, password, and database name.

Yes, this file wants username and password. So I can either include this as part of the .gitignore or find another solution. According to the [Sequelize options blog](https://github.com/sequelize/cli/blob/master/docs/README.md):

> By default the CLI will try to use the file config/config.js and config/config.json.

I found this [doc](https://medium.com/@ng.eric314/node-js-setting-up-sequelized-for-herokus-jawsdb-while-using-environmental-variables-3f4a0535c0fa) on how to change the config.json to config.js and use the .env variables in there. It also talks about how to use urls; meaning this might be how to import the JAWSDB stuff... (I didn't actually try this on heroku even though I set it up according ot the directions.) This seemed to work without setting up the `.sequlizerc` file.

### Models

I wont' go into the models because they were created pretty much exactly as they were in class. We did do a few things differently, like include the bcrypt in the `resolver.js` file instead of doing a hook in the model, but I don't think that matters particularly where that is done.

The `models/index.js` is where the most significant changes were made. This pretty much breaks down into 3 different areas, configuration, db creation, and associations. In class, we pretty much just used this for associations. Although we could have also done this with the db creation since we brought all of the models in and re-exported them from here, we just didn't combine them in to a single object.

- **Configuration**

This is where I did the import of the `.env` file. I realize I installed the `dotenv` package in the server level, so I had to use the `.env` file in the same level.

This proved to be almost exactly what we did for the `config/connection.js` file we used in class. The difference is that we are setting things up depending on the environment variable set in nodejs (or I think we can probably set it in .env too).

- **db Creation**

This pulls in each of the files in the directory and added them to the DB object as a model. This means that we don't have to do a whole bunch of `require` statements at the top of the folder to get the models imported.

```javascript
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
```

- **Associations**

The way they taught us in class was to set up the relationships in the `models/index.js` file, and this did it too - sort of. In each model, we created an "associate" function to define the model's relation to other models:

```javascript
    static associate(models) {
      User.hasMany(models.Recipe);
    }
```

This then added the association like this:

```javascript
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
```

### Migrations

OK, so a this point I don't get migrations or how to use them yet. As per the [documentation](https://sequelize.org/master/manual/migrations.html):

> Just like you use version control systems such as Git to manage changes in your source code, you can use migrations to keep track of changes to the database. With migrations you can transfer your existing database into another state and vice versa: Those state transitions are saved in migration files, which describe how to get to the new state and how to revert the changes in order to get back to the old state.

The definition makes sense, I just don't see the point. I'm chalking this up to an experience issue and the fact that I have pretty much never had to change a DB once it is in production.

These are created automatically if you use the generate command:

`npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string`

Where:

- `name`: the name of the model;
- `attributes`: the list of model attributes;

As far as I can tell, you can only do 1 attribute per field. So if you want a deeper attribute list, you'll have to go in and edit both the model and migration file. (https://github.com/sequelize/cli/issues/215)

Again, to run the `npx sequelize-cli db:migrate` command, the config file must be complete with **username** and **password**.

## The Server

So this demo used just the **Apollo Server** not the **Apollo Server Express** that I'm used to. I'm assuming this works as a full fledged server, but since there was no front end to it I'm not sure how it would be configured (read the docs!!!). There was no middleware either.

On the plus side, this made sense and I understood what was going on.

- **Organization**

So the author put the `index.js` (`server.js`) file under a `src` folder. He also included the `schema.js` (`typedefs.js`) and `resolvers.js` in the same folder.

This doesn't sit right with me for some reason. I think this needs to be separated for more clarity on what goes where. But I think this is just being opinionated. I can't say WHY this would be bad.

- **Context/Models**

The author also put the models in the context section. I DO think this will cause problems later when we try to use context and session management.

I was able to move the models out of the context and into the `resolvers.js` file and everything worked just fine there. I didn't have to use context now in the server and it could still be reserved.

**Note:** it isn't until we call the `models/index.js` file that the DB starts. This may be an argument as to why we should require it in the server file, but since we call resolvers from there... it shouldn't matter. This could also still probably be split out so the DB start is in its own file. There is nothing in the startup script that overlaps with the models scripts.

- **schema.js/resolvers.js**

Other than these being in the same directory and location, I'm happy to say that I probably could have programmed these without the tutorial. The schema.js is set up exactly like any other. The resolver.js was mostly the same as what we did in class, except it used sequelize commands instead of mongoose commands.

## Conclusion

So the tutorial was really easy to follow. The main exploration for this was to determine if and how GraphQL could be used with a SQL database. It turns out, using Sequelize, it is really easy. In the resolver.js file, instead of using Mongoose commands, you can just use sequelize commands and everything will work pretty much identically.

Using the Apollo server was pretty easy. However, the tutorial didn't go much further than the bare minimum of using GraphQL with it. I think I will be able to still use the Apollo-Express server that I'm more familiar with and not have any problems.

The side benefit to this tutorial is that I was introduced to Sequelize CLI. This is a very nice tool that will easily set up your models. However, you can't just "fire and forget" with it. You MUST go back in and manually set-up most of your column attributes and switch out the `config.json` file so that it will remain private if putting up on to a public repository.

## Additional reading

Sequelize relationships — Ultimate guide: https://medium.com/@eth3rnit3/sequelize-relationships-ultimate-guide-f26801a75554)

Sequelize CLI Options (docs): https://github.com/sequelize/cli/blob/master/docs/README.md

A Guide to ORM Sequelize: https://medium.com/@Ayra_Lux/a-guide-to-orm-sequelize-c276c7b6dd18

## Technologies Used

- [NodeJS](https://nodejs.org/en/)
- [Apollo Server](https://www.npmjs.com/package/apollo-server-express)
- [GraphQL](https://graphql.org/)
- [Sequelize](https://www.npmjs.com/package/sequelize)
- [Sequelize-CLI](https://www.npmjs.com/package/sequelize-cli)
- [MySQL2](https://www.npmjs.com/package/mysql2)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)

## About the Author

Chip Long (https://github.com/Chip-L), just completed the Denver University Coding Bootcamp. For the past 12 years I have done Software Quality Assurance. I am now starting off on the new journey of joining the darkside and becoming a developer so other people can find my mistakes!
