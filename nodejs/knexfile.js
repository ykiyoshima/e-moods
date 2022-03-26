// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
import dotenv from "dotenv";

dotenv.config();

const knexfile = {

  development: {
    client: "mysql",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory:'./db/migrations',
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: "mysql",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory:'./db/migrations',
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: "mysql",
    connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory:'./db/migrations',
      tableName: 'knex_migrations'
    }
  }

};

export default knexfile;