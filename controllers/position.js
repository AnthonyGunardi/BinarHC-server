const { Position } = require('../models');
const { sendData, sendResponse } = require('../helpers/response.js');

class PositionController {
    static async getPositions(req, res) {
        try {
            const positions = await Position.findAll({
                attributes: ['title', 'description', 'updatedAt', 'createdAt']
            })
            sendData(200, positions, "Success Get All Positions", res)
        } catch (error) {
            sendResponse(500, error.message, res)
        };
    };

    static async getPosition(req, res) {
        try {
            const position = await Position.findOne({
                where: {
                    uuid: req.params.uuid,
                }
            })

            if (!position) return sendResponse(404, "Position not found", res)

            sendData(200, position, "Success Get Detail Position", res)
        } catch (error) {
            sendResponse(500, error.message, res)
        }
    }

    static async addPosition(req, res) {
        try {
            const isExists = await Position.findOne({
                where: {
                    title: req.body.title
                }
            })

            if(isExists) return sendResponse(400, "Position already exists", res)

            const position = await Position.create(req.body);
            
            sendData(200, position, "Success create position", res)
        } catch (error) {
            sendResponse(500, error.message, res)
        }
    }

};

module.exports = PositionController;