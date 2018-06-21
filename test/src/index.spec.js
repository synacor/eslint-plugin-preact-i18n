import assert from 'assert';
import api from '../../src';


describe('module exports', () => {

	it('should have exactly 4 rules defined', () => {
		assert.deepEqual(Object.keys(api), ['rules']);
		assert.ok(api.rules['no-unknown-key']);
		assert.ok(api.rules['no-text-as-children']);
		assert.ok(api.rules['no-text-as-attribute']);
		assert.ok(api.rules['no-missing-template-field']);
	});
});
