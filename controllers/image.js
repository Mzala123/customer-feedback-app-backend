var mongoose = require("mongoose")

var Image = mongoose.model("Image")
var fs = require('fs')


var sendJSONresponse = function (res, status, content) {
    res.status(status)
    res.json(content)
}


module.exports.uploadImage = async function (req, res) {
    try {
        if (req.file && req.file.path) {
            const image = new Image({
                image_url : req.file.path
            })
            await image.save();
            sendJSONresponse(res, 201, {image_url:image.image_url})
        } else {
            console.log(req.file)
            sendJSONresponse(res, 422, { error: "Invalid" })
        }
    }catch(error){
        console.log(error)
    }

}