const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const config = require('config');

const dynamodb = new AWS.DynamoDB.DocumentClient();

//export AWS_PROFILE=felpy
//export AWS_REGION=us-east-1

const insertData = () => {
    if (!process.env.AWS_PROFILE || !process.env.AWS_REGION) {
        console.log('usa los siguientes comandos:');
        console.log('export AWS_PROFILE=<perfil>');
        console.log('export AWS_REGION=<region>');
        return
    }

    const tmp = path.join(__dirname, config.get('filename'));
    const output = fs.readFileSync(tmp, { encoding:'utf8', flag:'r' })

    JSON.parse(output).forEach((item) => {
        let putRequest = {
            TableName: config.get('tableName'),
            Item: {
                ...item
            }
        };
        dynamodb.put(putRequest)
            .promise()
            .then((data) => {
                console.info('successfully update to dynamodb', data)
            })
            .catch((err) => {
                console.info('failed adding data dynamodb', err)
            });
    })
};

insertData();
