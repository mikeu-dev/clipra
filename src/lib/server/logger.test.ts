import { describe, it, expect, vi } from 'vitest';
import { logger } from './modules/core/logger';

describe('Logger', () => {
	it('should define logger instance', () => {
		expect(logger).toBeDefined();
	});

	it('should have log methods', () => {
		expect(typeof logger.info).toBe('function');
		expect(typeof logger.error).toBe('function');
		expect(typeof logger.warn).toBe('function');
		expect(typeof logger.debug).toBe('function');
	});

	it('should log without error', () => {
		const spy = vi.spyOn(logger, 'info');
		logger.info('Test log message', { meta: 'data' });
		expect(spy).toHaveBeenCalled();
	});
});
