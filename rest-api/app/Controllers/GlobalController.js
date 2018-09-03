/**
 *
 *   MODELS
 *
 * */
const User = require('./../../../components/models/core/user');
const ApiUser = require('./../../../components/models/core/api-user');
const Release = require('./../../../components/models/core/release');
const Playlist = require('./../../../components/models/core/playlist');
const Package = require('./../../../components/models/core/api-package');


class GlobalController {

    async search(Request, Response) {

        try {
            let users = await User.find(Request.body);
            let releases = await Release.find(Request.body);

            Response.send({
                success:true,
                data: {
                    users: users,
                    releases: releases
                }
            })
        } catch(Error) {
            Response.send({success: false, error: Error.message})
        }
    }

}

module.exports =  GlobalController;