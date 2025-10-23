import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  allowBooleanAttributes: true,
  trimValues: true
});

export function parseXmlBuffer (buf) {
  try {
    const text = buf.toString('utf8');
    const json = parser.parse(text);
    if (!json) throw new Error('Empty XML');
    return json;
  } catch (e) {
    const err = new Error('Invalid or malformed XML');
    err.status = 422;
    throw err;
  }
}
