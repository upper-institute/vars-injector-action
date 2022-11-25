
const core = require('@actions/core')

const aws = require('./aws')

const parseVars = (vars) => {

    if (vars === null) {
        return []
    }

    if (Array.isArray(vars)) {
        return vars
    }

    if (typeof vars === 'string') {
        try {

            const varsMap = []

            const varsObject = JSON.parse(vars)

            for (const item of Object.entries(varsObject)) {
                varsMap.push(item)
            }

            return varsMap

        } catch (e) {
            return [vars.split('=')]
        }
    }

    return vars

}


async function main() {
    try {
        const driver = core.getInput('driver')
        const path = core.getInput('path')
        const prefix = core.getInput('prefix') || ''
        const sensitive = core.getBooleanInput('sensitive')

        let varsFromSource = null

        console.log(`Injecting environment variables from "${path}" (driver: "${driver}")`)

        switch (driver) {
            case 'aws.ssm_parameter':
                aws.configure()

                varsFromSource = await aws.getFromSSMParameter(
                    path,
                    process.env.AWS_SSM_DECRYPT === 'true'
                )

                break;

            default:
                throw new Error(`Invalid driver: ${driver}`)
        }

        core.debug(`varsFromSource: ${varsFromSource}`)

        const vars = parseVars(varsFromSource)

        for (let [key, value] of vars) {

            const envKey = `${prefix}${key}`

            console.log(`Set "$${envKey}" environment variable`)

            if (sensitive) {
                core.maskValue(value)
            }

            core.setEnvironmentVar(envKey, value)
        }

        console.log(`${vars.length} environment vars parsed`)

    } catch (error) {
        core.setFailed(error.message)
    }
}


main().catch(core.setFailed)