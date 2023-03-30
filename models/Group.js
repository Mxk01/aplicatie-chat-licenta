let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let groupSchema = new mongoose.Schema({
    groupName : {
        type:String,
        required:true
    },
    // get member messages from groupMembers
    groupMembers: {
        type:[mongoose.Schema.Types.ObjectId],
        ref:'User'
    },
    groupAdmin: {
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})
module.exports = mongoose.model('Group',groupSchema)