import * as core from '@actions/core'
import * as aws from './aws'

async function main() {

    const driver = core.getInput('driver')
    const path = core.getInput('path')
    const prefix = core.getInput('prefix') || ''
    const sensitive = core.getBooleanInput('sensitive')

    core.info(`Injecting environment variables from "${path}" (driver: "${driver}")`)

    const [provider] = driver.split('.', 1)

    switch (provider) {
        case 'aws':
            aws.configure()
            break;
    
        default:
            throw new Error(`Invalid provider: ${provider}`)
    }

    let kv: Map<string, string> | null = null

    switch (driver) {
        case 'aws.ssm_parameter':
            kv = await aws.getFromSSMParameters(path, process.env.AWS_SSM_DECRYPT === 'true')
            break;
    
        default:
            throw new Error(`Invalid driver: ${driver}`)
    }

    if (kv === null) {
        core.warning(`No values found to be injected in the workflow execution`)
        return

    }

    for (let [key, value] of kv.entries()) {

        const envKey = `${prefix}${key}`

        core.info(`Set "$${envKey}" environment variable`)

        if (sensitive) {
            core.setSecret(value)
        }
        
        core.exportVariable(envKey, value)

    }

}

main().catch(err => core.setFailed(err))