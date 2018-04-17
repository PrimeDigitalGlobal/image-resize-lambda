var config = require('./config');
var ProcessImage = require('./app/processImage');
var paramParser = require('./app/paramParser');
var ProcessRaw = require('./app/processRaw');
var ProcessPdf = require('./app/processPdf');

exports.handler = function(event, context, callback) {
    console.log("Lambda event Occurred, event=", event, ", context=", context);
    const key = event.queryStringParameters.key;
    var processorData = paramParser.processAllParse(['processor'], key);

    console.log("Parsed image url for processor data. ProcessorData=", processorData);
    if (processorData) {
        function processCallback(err, data) {
            if (!err){
                callback(null, {
                    statusCode: '307',
                    headers: { 'location': config.BASE_DESTINATION_URL + key},
                    body: ''
                });
            } else {
                callback(null, {
                    statusCode: '405',
                    body: 'Method not supported'
                });
            }
        }

        var imageProcessor;
        var rawProcessor;
        var pdfProcessor;
        var params;
        var parseArray;

        console.log(processorData);

        if (processorData.processor == 'images') {
            parseArray = ['size', 'extend', 'blur', 'autoRotate', 'processType'];
            params = paramParser.processAllParse(parseArray, processorData.path);
            console.log("Parsed image processing params. params=", params);
            imageProcessor = true;
        } else if (processorData.processor == 'pdf') {
            console.log("Parsing raw pdfs");
            pdfProcessor = true;
        } else if (processorData.processor == 'raw') {
            console.log("Parsing raw images");
            rawProcessor = true;
        }

        if (imageProcessor && params) {
            ProcessImage.processImage(key, params, processCallback);
        } else if (pdfProcessor) {
            ProcessPdf.processPdf(processorData.path, processCallback);
        } else if (rawProcessor) {
            ProcessRaw.processRaw(processorData.path, key.replace(/^\//, ''), processCallback);
        } else {
            console.log("Image processor or raw processor not found in request.");
            callback(null, {
                statusCode: '405',
                body: 'Method not supported'
            });
        }
    } else {
        console.log("Processor data not found in request.");
        callback(null, {
            statusCode: '405',
            body: 'Method not supported'
        });
    }

};
