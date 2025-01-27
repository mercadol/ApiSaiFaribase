const { nanoid } = require('nanoid');

const generateTimestampedId = () => {
  const timestamp = new Date().toISOString();
  console.log(timestamp);
  console.log(Date.now);
  console.log(Date());
  
  const nanoidPart = nanoid(5);
  const timestampedId = `${timestamp.replace(/[:.-]/g, '')}-${nanoidPart}`; // Eliminamos los separadores de la fecha
  return timestampedId;
};

module.exports = { generateTimestampedId };
