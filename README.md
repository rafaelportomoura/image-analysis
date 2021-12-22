<!--
title: 'Image Analysis'
description: 'Uma aplicação para reconhecimento de imagens'
layout: Doc
framework: v2
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/rafaelportomoura'
authorName: 'Rafael Moura'
-->

# Image Analysis

Uma aplicação para reconhecimento de imagens

## Usage

### Deployment

Para implantar o exemplo, você precisa executar o seguinte comando:

```bash
serverless deploy
```

Depois de executar a implantação, você deve ver a saída semelhante a:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node.zip file to S3 (711.23 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.................................
Serverless: Stack update finished...
Service Information
service: aws-node
stage: dev
region: us-east-1
stack: aws-node-dev
resources: 6
functions:
  api: aws-node-dev-hello
layers:
  None
```

### Invocation

Após a implantação bem-sucedida, você pode invocar a função implantada usando o seguinte comando:

```bash
serverless invoke --function img-analysis --path request.json
```

Que deve resultar em resposta semelhante ao seguinte:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Imagem: ${imageUrl}\n\nA imagem tem:\n${text}\",\n  \"input\": {}\n}"
}
```

### Local development

Você pode invocar sua função localmente usando o seguinte comando:

```bash
serverless invoke local -f img-analysis --path request.json
```

Que deve resultar em resposta semelhante ao seguinte:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Imagem: ${imageUrl}\n\nA imagem tem:\n${text}\",\n  \"input\": {}\n}"
}
```
