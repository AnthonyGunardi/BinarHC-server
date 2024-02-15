class Response {
    static sendResponse (statusCode, message, res) {
        return res.status(statusCode).json({
            message: message
        });
    }

    static sendData (statusCode, data, message, res) {
        return res.status(statusCode).json({
            message: message,
            payload: data
        });
    }

    static sendDataScroll (statusCode, data, lastID, next, message, res) {
        return res.status(statusCode).json({
            message: message,
            payload: data,
            lastData: lastID,
            next: next
        });
    }
}


module.exports = Response;