module.exports = async function failOnPurpose(page) {
  console.log('❌ This step is designed to fail on purpose.');
  throw new Error('💥 Intentional failure for testing purposes.');
};
