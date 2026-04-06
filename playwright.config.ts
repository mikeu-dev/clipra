import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config'; // Load environment variables

export default defineConfig({
	webServer: {
		command: process.env.CI
			? 'export NODE_OPTIONS="--max-old-space-size=8192" && npm run build && npm run preview'
			: 'npm run dev',
		port: process.env.CI ? 4173 : 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 300000 // 5 minutes to allow for build time
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
		// {
		//     name: 'firefox',
		//     use: { ...devices['Desktop Firefox'] },
		// },
		// {
		//     name: 'webkit',
		//     use: { ...devices['Desktop Safari'] },
		// },
	]
});
