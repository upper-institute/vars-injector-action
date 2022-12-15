import * as AWS from 'aws-sdk'
import { GetParametersByPathRequest, GetParametersByPathResult } from 'aws-sdk/clients/ssm'
import * as core from '@actions/core'

export const configure = () => {

    let region = process.env.AWS_REGION || false

    if (region) {
        AWS.config.update({ region })
    }

}

export const getFromSSMParameters = async (basePath: string, decryption: boolean): Promise<Map<string, string>> => {

    const ssm = new AWS.SSM()

    const params: GetParametersByPathRequest = {
        Path: basePath,
        Recursive: true,
        WithDecryption: decryption
    }

    const kv = new Map<string, string>()

    do {

        await new Promise((resolve, reject) => {
            ssm.getParametersByPath(params, (err: AWS.AWSError, data: GetParametersByPathResult) => {

                if (err) {
                    reject(err)
                    return
                }

                if (!data.Parameters || data.Parameters.length == 0) {
                    delete params.NextToken
                    resolve(null)
                    return
                }

                for (let parameter of data.Parameters) {
                    
                    core.info(`Getting value from SSM Parameter: ${parameter.Name}`)

                    if (parameter.Name && parameter.Value) {

                        kv.set(
                            parameter.Name.substring(parameter.Name.lastIndexOf('/') + 1),
                            parameter.Value
                        )

                    }

                }



            })
        })

    } while (params.NextToken)

    return kv

}