
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, email: 'test1@gmail.com', fName: "john", lName:"doe", password: "123", role: 1},
        {id: 2, email: 'test2@gmail.com', fName: "jane", lName: "doe", password: "321", role: 1 },
      ]);
    });
};
