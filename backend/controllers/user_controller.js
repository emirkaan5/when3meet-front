const User = require('../db_schema/user_model');

exports.createUser = async (req, res) => {
  try {
    // expects { name, email } in request body
    const user = await User.create(req.body);
    res.status(201).json(user);                 // 201 = Created
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
