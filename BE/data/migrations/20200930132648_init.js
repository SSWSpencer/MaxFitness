
exports.up = function(knex) {
    return knex.schema.createTable("users", user=>{
        user.increments();
        user.string("email").notNullable().unique();
        user.string("fName").notNullable();
        user.string("lName").notNullable();
        user.string("password").notNullable();
        user.integer("role").notNullable();
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users")
  };
  