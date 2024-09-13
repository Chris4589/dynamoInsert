const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const config = require('config');

AWS.config.update({ region: "us-east-1" });
const dynamodb = new AWS.DynamoDB.DocumentClient();

//export AWS_PROFILE=felsv
//export AWS_REGION=us-east-1

const insertData = () => {
    if (!process.env.AWS_PROFILE || !process.env.AWS_REGION) {
        console.log('usa los siguientes comandos:');
        console.log('export AWS_PROFILE=<perfil>');
        console.log('export AWS_REGION=<region>');
        return
    }

    const tmp = path.join(__dirname, config.get('filename'));
    const output = fs.readFileSync(tmp, { encoding:'utf8', flag:'r' });

    JSON.parse(output).forEach((item) => {
        let putRequest = {
            TableName: config.get('tableName'),
        };
        
        if (new Boolean(item.delete) == true) {
            putRequest.Key = {};
            /*putRequest.Key = {
                constantCode: item.constantCode,
                code: item.code.toString()
            };*/
            if (item.constantCode) {
                if (typeof item.constantCode === 'number') {
                    putRequest.Key.constantCode = item.constantCode;
                } else if (typeof item.constantCode === 'string') {
                    putRequest.Key.constantCode = item.constantCode.toString();
                }
                if (item.code) {
                    if (typeof item.code === 'number') {
                        putRequest.Key.code = item.code;
                    } else if (typeof item.code === 'string') {
                        putRequest.Key.code = item.code.toString();
                    }
                }
            } else if (item.orderCode) {
                if (item.code) {
                    if (typeof item.code === 'number') {
                        putRequest.Key.code = item.code;
                    } else if (typeof item.code === 'string') {
                        putRequest.Key.code = item.code.toString();
                    }
                }
                if (typeof item.orderCode === 'number') {
                    putRequest.Key.orderCode = item.orderCode;
                } else if (typeof item.orderCode === 'string') {
                    putRequest.Key.orderCode = item.orderCode.toString();
                }
            } else if (item.stateCode) {
                if (typeof item.stateCode === 'number') {
                    putRequest.Key.stateCode = item.stateCode;
                } else if (typeof item.stateCode === 'string') {
                    putRequest.Key.stateCode = item.stateCode.toString();
                }
                if (item.code) {
                    if (typeof item.code === 'number') {
                        putRequest.Key.code = item.code;
                    } else if (typeof item.code === 'string') {
                        putRequest.Key.code = item.code.toString();
                    }
                }
            }

            dynamodb.delete(putRequest)
            .promise()
            .then((data) => {
                console.info('successfully delete on dynamodb', data)
            })
            .catch((err) => {
                console.info('failed deleting data on dynamodb', err)
            });
            
        } else {
            putRequest.Item = {
                ...item,
            };
            if (new Boolean(item.orderCode) == true) {
                putRequest.Item.searchField = `${item.orderCode}-${item.description.toUpperCase()}`;
            } else if (new Boolean(item.code) == true) {
                putRequest.Item.searchField = `${item.code}-${item.description.toUpperCase()}`;
            }
            dynamodb.put(putRequest)
            .promise()
            .then((data) => {
                console.info('successfully update to dynamodb', data)
            })
            .catch((err) => {
                console.info('failed adding data dynamodb', err)
            });
        }
    });
};

insertData();



/**
    Item: {
                ...item,
                //code: +item.code,
                //constantCode: 1,
                //searchField: `${item.code}-${item.description.toUpperCase()}` 
                code: 1,
                searchField: `${item.orderCode}-${item.description.toUpperCase()}`
            }
 */
