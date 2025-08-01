# formdata-parser
Parse the form data


## Installation

`npm install @trojs/formdata-parse`
or
`yarn add @trojs/formdata-parse`

## Test the package

`npm run test`
or
`yarn test`

## How to use


```javascript
import parseFormData from '@trojs/formdata-parse';

 const response = parseFormData('-----------------------------12946965154256166883262710838\r\n' +
    'Content-Disposition: form-data; name="fileName"; filename="test.txt"\r\n' +
    'Content-Type: text/plain\r\n' +
    '\r\n' +
    '42\n' +
    '\r\n' +
    '-----------------------------12946965154256166883262710838\r\n' +
    'Content-Disposition: form-data; name="fileName2"; filename="test.xml"\r\n' +
    'Content-Type: text/xml\r\n' +
    '\r\n' +
    '43\n' +
    '\r\n' +
    '-----------------------------12946965154256166883262710838--\r\n', 'multipart/form-data; boundary=---------------------------12946965154256166883262710838')
```

Result:
```javascript
[
  {
    fieldName: 'fileName',
    fileName: 'test.txt',
    contentType: 'text/plain',
    fileData: '42\n',
    boundary: '---------------------------12946965154256166883262710838'
  },
  {
    fieldName: 'fileName2',
    fileName: 'test.xml',
    contentType: 'text/xml',
    fileData: '43\n',
    boundary: '---------------------------12946965154256166883262710838'
  }
]
```

Types:
```typescript
{
    fileName: string;
    fileData: string;
    field: string;
    contentType: string;
    boundary: string;
}
```
See also the src/types.d.ts file
