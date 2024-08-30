import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from "fs";
import { InsertOneCustomer } from "./DB/DbContext";

dotenv.config();

const genAI = new GoogleGenerativeAI(String(process.env.GEMINI_API_KEY));

function fileToGenerativePart(path:string, mimeType:string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

export async function Gemini(/*image_url: string*/) {
  const model = genAI.getGenerativeModel({model: "gemini-1.5-pro"});

  /**
   * É possível trabalhar com o Gemini e a função descrita utilizando também um anexo de imagem. Para isto, seria necessário os seguintes códigos:
    
   * const prompt = `Escreva um texto em formato de objeto JSON com os dados conforme a imagem enviada, em base64. Escreva a resposta sem mencionar a tag json, de forma que seja possível converter para Json depois utilizando a função JSON.parse() do JavaScript. Faça a extração dos dados e descreva a resposta com a seguinte estrutura de dados: {
     "image": "link temporário para a imagem (máximo de 3 linhas)",
     "customer_code": "string",
     "measure_datetime": "date",
     "measure_type": "WATER" ou "GAS",
     "measure_value": integer
   }`;

   *const imagePart = fileToGenerativePart(image_url, "image/png");
   *const result = await model.generateContent([prompt, imagePart]);
   */

  const prompt = `Escreva um texto em formato de objeto JSON com os dados como se estivesse enviando uma imagem de conta de água pela empresa de saneamento. Escreva a resposta sem mencionar a tag json, de forma que seja possível converter para Json depois utilizando a função JSON.parse() do JavaScript. Faça a extração dos dados e descreva a resposta com a seguinte estrutura de dados: {
    "image": "link temporário para a imagem base64 (máximo de 3 linhas)",
    "customer_code": "string (9 números totalmente aleatórios)",
    "measure_datetime": "date",
    "measure_type": "WATER" ou "GAS",
    "measure_value": integer
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const jsonResult = JSON.parse(text);

  return InsertOneCustomer(jsonResult.customer_code, jsonResult.image, jsonResult.measure_datetime, jsonResult.measure_type, jsonResult.measure_value);
}
