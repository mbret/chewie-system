var path = require("path");

module.exports = {
    modules: [
        {
            module: require(require("path").resolve(__dirname, "screen")),
            name: "default-screen",
            type: "screen",
            // to avoid synchronized folder
            publicPath: path.resolve("C:/Users/mbret/Workspace/my-buddy/my-buddy-system/_dev-windows-screens/plugins/default-screen/screen/public")
        }
    ],

    options: []
};