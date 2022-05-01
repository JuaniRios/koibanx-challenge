const User = require('../models/user')
const logger = require('../utils/logger')
const dotenv = require("dotenv");
dotenv.config();

exports.init = async function () {
    if (await User.countDocuments({"username": "test@koibanx.com"})) {
        return
    }

    let user = new User();
    user.username = process.env.TEST_USERNAME;
    user.password = process.env.TEST_PASSWORD;
    await User.create(user);

    logger.info("Test User created")
}
