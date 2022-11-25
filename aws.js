const AWS = require('aws-sdk')

export const configure = () => {

    region = process.env.AWS_REGION || false

    if (region) {
        AWS.config.update({ region })
    }

}


export const getFromSSMParameter = async(varPath, decryption) => {

   const ssm = new AWS.SSM()

   const params = {
        Name: varPath,
        WithDecryption: decryption,
   }

   const result = await ssm.getParameter(params).promise()

   return result.Parameter.Value

}