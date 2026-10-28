import assert from 'node:assert/strict';
import { test } from 'node:test';
import { featuresFromOpenApiDocument } from './features.js';

test('maps Arrests.org face search to its feature price key', () => {
  const features = featuresFromOpenApiDocument({
    paths: {
      '/v1/search/intelligence/facial/arrests': {
        post: {
          operationId: 'searchArrestsFace',
          summary: 'Arrests.org Face Search',
          tags: ['intelligence'],
          responses: {
            200: { content: { 'application/json': {} } },
          },
        },
      },
    },
  });

  assert.equal(features[0].name, 'arrests.face');
  assert.equal(features[0].priceKey, 'arrests.face');
  assert.equal(features[0].path, '/v1/search/intelligence/facial/arrests');
});
