/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex, Promise) {
  return knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', function(t) {
        t.increments('id').primary().unsigned();
        t.string('username', 255);
        t.string('email', 255).unique();
        t.string('password', 255);
        t.string('favorite_id_1', 50);
        t.string('favorite_id_2', 50);
        t.string('favorite_id_3', 50);
        t.string('favorite_id_4', 50);
        t.string('favorite_id_5', 50);
        t.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        t.datetime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
      });
    }else{
        return new Error("The table already exists");
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex, Promise) {
  return knex.schema.hasTable('users').then(function(exists) {
    if (exists) {
        return knex.schema.dropTable('users');
    }
  });
};