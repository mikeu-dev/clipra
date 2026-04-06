import { createHash, randomBytes } from 'crypto';

export class DigestAuthClient {
	private nc = 0;
	private cnonce: string;

	constructor(
		private username: string,
		private secret: string,
		private algorithm: string = 'MD5'
	) {
		this.cnonce = randomBytes(8).toString('hex');
	}

	private md5(data: string): string {
		return createHash('md5').update(data).digest('hex');
	}

	/**
	 * Generates the Authorization header value for Digest Auth.
	 * It usually requires an initial 401 response from the server to get the 'nonce', 'realm', 'qop'.
	 * So a robust client usually requests once, gets 401, then retries with header.
	 */
	generateHeader(
		method: string,
		uri: string,
		realm: string,
		nonce: string,
		qop: string,
		opaque: string
	) {
		this.nc++;
		const ncStr = this.nc.toString(16).padStart(8, '0');
		const ha1 = this.md5(`${this.username}:${realm}:${this.secret}`);
		const ha2 = this.md5(`${method}:${uri}`);
		const response = this.md5(`${ha1}:${nonce}:${ncStr}:${this.cnonce}:${qop}:${ha2}`);

		return `Digest username="${this.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${ncStr}, cnonce="${this.cnonce}", response="${response}", opaque="${opaque}"`;
	}

	/**
	 * Parsing WWW-Authenticate header from 401 response
	 */
	static parseAuthHeader(header: string) {
		// Example: Digest qop="auth", realm="IP Camera(12345)", nonce="...", opaque="..."
		const matches = {
			realm: (header.match(/realm="([^"]+)"/) || [])[1],
			nonce: (header.match(/nonce="([^"]+)"/) || [])[1],
			qop: (header.match(/qop="([^"]+)"/) || [])[1],
			opaque: (header.match(/opaque="([^"]+)"/) || [])[1]
		};
		return matches;
	}
}
