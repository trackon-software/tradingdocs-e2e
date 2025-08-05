// src/config/extractorConfig.js

module.exports = {
  url: 'https://demo.tradingdocs.ai/extractors',
  extractor: {
    // For addExtractor
    name: 'Test Extractor',
    description: 'This is a test extractor.',
    isActive: 'Y',
    isRepeating: 'false',
    entityName: 'PO',
    itemType: 'Sample Item',
    specialInstructions: 'Handle with care',
    itemIdentifier: 'ID-12345',
    batchSize: '10',
    itemPatterns: 'pattern1, pattern2',

    // For updateExtractor
    originalName: 'Test Extractor',           // Must match the name of the row to be updated
    updatedName: 'Updated Extractor Name',
    updatedDescription: 'Updated Description',
    updatedIsActive: 'N'
  }
};
