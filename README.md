# Vars Injector Action

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `driver`

**Required** The name of the person to greet. Default `"World"`.

### `path`

**Required** Path of the parameter (according to driver specification).

### `prefix`

Prefix for environment variables, example `"VARS_"`. Default `""`.

### `sensitive`

**Required** When true, will mask values from action log. Default `"true"`.

## Outputs

No outputs are set, only environment variables injected from source driver.

## Example usage

### AWS SSM Parameter

```yaml
name: Inject environment variables from AWS SSM Parameter Store
uses: upper-institute/vars-injector-action@v1
env:
  # Optional, configure session region
  AWS_REGION: 'us-east-1'
  # Return decrypted secure string value. Return decrypted values for secure string parameters. This flag is ignored for String and StringList parameter types.
  AWS_SSM_DECRYPT: 'true'
with:
  driver: 'aws.ssm_parameter'
  path: '/path/to/parameter'
  sensitive: 'true'
```