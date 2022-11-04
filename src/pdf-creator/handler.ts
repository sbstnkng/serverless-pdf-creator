import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { Message, PdfFile } from '../types';
import { create } from './creator';

const getParsedMessage = (body: string | null): Message => {
  if (!body) {
    throw new Error('no body sent with request');
  }

  try {
    const parsedBody = JSON.parse(body);
    return { firstname: parsedBody.firstname, lastname: parsedBody.lastname };
  } catch (error) {
    throw new Error('unparseable body sent with request');
  }
};

export const createPdf: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const message: Message = getParsedMessage(event.body);

  const pdf: PdfFile = await create(message);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=congratulations.pdf',
    },
    body: pdf.toString('base64'),
    isBase64Encoded: true,
  };
};
