'use strict';
const {
  promises: { readFile, writeFile },
} = require('fs');
const aws = require('aws-sdk');
const { get } = require('axios');
require('dotenv').config();

class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc;
  }

  async writeFileFunction(obj, path, json = true) {
    if (process.env.AMBIENT !== 'production') {
      try {
        if (json) await writeFile(path, JSON.stringify(obj));
        else await writeFile(path, obj);
      } catch (error) {
        await writeFile('logs/error.json', JSON.stringify(error));
      }
    }
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc
      .detectLabels({
        Image: {
          Bytes: buffer,
        },
      })
      .promise();

    this.writeFileFunction(result, 'logs/result.json');

    return result;
  }

  async filterItensPerConfidence(result, confidence = 80) {
    const workingItens = result.Labels.filter(
      ({ Confidence }) => Confidence > confidence,
    );

    this.writeFileFunction(workingItens, 'logs/workingItens.json');

    return workingItens;
  }

  async returnNamesOfItems(workingItens, separador) {
    const names = workingItens.map(({ Name }) => Name).join(separador);

    this.writeFileFunction(names, 'logs/names.txt', false);

    return names;
  }

  async translateTxt(
    Text,
    SourceLanguageCode = 'en',
    TargetLanguageCode = 'pt',
  ) {
    const params = { SourceLanguageCode, TargetLanguageCode, Text };
    const result = await this.translatorSvc.translateText(params).promise();

    this.writeFileFunction(result, 'logs/translateText.json');

    return result.TranslatedText;
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, { responseType: 'arraybuffer' });

    const buffer = Buffer.from(response.data, 'base64');

    return buffer;
  }

  formatTextResults(texts, workingItens) {
    const finalText = [];
    for (const indexText in texts) {
      const name = texts[indexText];
      const confidence = workingItens[indexText].Confidence;
      finalText.push(
        `${confidence.toFixed(2)}% de chance de ser do tipo ${name}`,
      );
    }

    return finalText.join('\n');
  }

  formatToBody(text, imageUrl) {
    return `Imagem: ${imageUrl}\n\nA imagem tem:\n${text}`;
  }

  async main(event) {
    try {
      if (
        !event.queryStringParameters ||
        !event.queryStringParameters.imageUrl
      ) {
        throw new Error('Não foi passado uma imagem');
      }

      const { imageUrl } = event.queryStringParameters;
      // const imgBuffer = await readFile('./images/cat.jpg');

      console.log('Downloading image...');
      const imgBuffer = await this.getImageBuffer(imageUrl);

      const separador = ' | ';

      console.log('Detecting labels...');
      const result = await this.detectImageLabels(imgBuffer);
      const workingItens = await this.filterItensPerConfidence(result);
      const names = await this.returnNamesOfItems(workingItens, separador);

      console.log('Translating to Portuguese...');
      const translateTxt = await this.translateTxt(names);

      console.log('Handling final object...');
      const finalText = this.formatTextResults(
        translateTxt.split(separador),
        workingItens,
      );

      console.log('Finishing...');

      this.writeFileFunction(process.env, 'logs/nodeEnv.json');

      return {
        statusCode: 200,
        body: this.formatToBody(finalText, imageUrl),
      };
    } catch (error) {
      console.log(`Erro: ${error.stack}`);
      return {
        statusCode: 500,
        body: `Internal server erro!\nError Message: ${error.message}\nError Stack: ${error.stack}`,
      };
    }
  }
}

// Factory
const reko = new aws.Rekognition();
const translator = new aws.Translate();
const handler = new Handler({ rekoSvc: reko, translatorSvc: translator });

module.exports.main = handler.main.bind(handler);
