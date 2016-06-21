var path = require("path");

module.exports = {
    modules: [
        {
            module: require(require("path").resolve(__dirname, "screen")),
            name: "default-screen",
            type: "screen"
        }
    ],

    options: []
};