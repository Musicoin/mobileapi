const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const moment = require('moment');
const stackTrace = require('stack-trace');
require('winston-daily-rotate-file');
const fs = require('fs');

const LOGS_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
}

// file size limit 10M
const LOGGER_COMMON_CONFIG = {
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
    prepend: true,
    datePattern: 'YYYY-MM-DD',
    maxsize: "10m",
    maxFiles: "14d",
    colorize: false,
    json: false,
    handleExceptions: true,
};

let logger = new winston.Logger({
    transports: [
        new(winston.transports.DailyRotateFile)({
            name: 'error',
            level: 'error',
            filename: LOGS_DIR + '/error-%DATE%.log',
            ...LOGGER_COMMON_CONFIG,
        }),
        new(winston.transports.DailyRotateFile)({
            name: 'warn',
            level: 'warn',
            filename: LOGS_DIR + '/warn-%DATE%.log',
            ...LOGGER_COMMON_CONFIG,
        }),
        new(winston.transports.DailyRotateFile)({
            name: 'normal',
            level: 'info',
            filename: LOGS_DIR + '/normal-%DATE%.log',
            ...LOGGER_COMMON_CONFIG,
        }),
        new winston.transports.Console({
            name: 'debug',
            level: 'debug',
            colorize: true,
            json: false,
            handleExceptions: true,
        }),

    ],
    exitOnError: false,
});

let accessLogger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            name: 'info',
            level: 'info',
            json: false,
            ...LOGGER_COMMON_CONFIG,
        }),
        new(winston.transports.DailyRotateFile)({
            name: 'access',
            level: 'info',
            filename: LOGS_DIR + '/access-%DATE%.log',
            ...LOGGER_COMMON_CONFIG,
        }),
    ],
    exitOnError: false,
});

logger.stream = {
    write: function (message) {
        accessLogger.info(message.trim());
    }
};

let Logger = {

    initRequestLogger: function (app) {
        app.use(morgan(function (tokens, req, res) {
            const method = req.method;
            const url = req.originalUrl;
            const request_params = JSON.stringify(req.body);
            return [
                method,
                url,
                "params:",
                request_params,
                tokens.status(req, res),
                tokens['response-time'](req, res), 'ms'
            ].join(' ')
        }, {
            stream: logger.stream
        }));
    },

    debug: function () {
        if (process.env['NODE_ENV'] === 'development') {
            let cellSite = stackTrace.get()[1];
            logger.debug.apply(
                logger,
                [
                    ...arguments,
                    {
                        FilePath: cellSite.getFileName(),
                        LineNumber: cellSite.getLineNumber(),
                    }
                ]
            );
        }
    },
    info: function () {
        let cellSite = stackTrace.get()[1];
        logger.info.apply(
            logger,
            [
                ...arguments,
                {
                    FilePath: cellSite.getFileName(),
                    LineNumber: cellSite.getLineNumber(),
                }
            ]
        );
    },
    warn: function () {
        let cellSite = stackTrace.get()[1];
        logger.warn.apply(
            logger,
            [
                ...arguments,
                {
                    FilePath: cellSite.getFileName(),
                    LineNumber: cellSite.getLineNumber(),
                }
            ]
        );
    },

    error: function () {
        let cellSite = stackTrace.get()[1];
        logger.error.apply(
            logger,
            [
                ...arguments,
                {
                    filePath: cellSite.getFileName(),
                    lineNumber: cellSite.getLineNumber(),
                }
            ]
        );
    },
};
module.exports = Logger;