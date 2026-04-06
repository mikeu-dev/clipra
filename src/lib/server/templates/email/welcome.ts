import { EmailLayout } from './layout';
import * as m from '$lib/paraglide/messages.js';

export const WelcomeEmailTemplate = (email: string) => {
	const content = `
        <h2>${m.email_welcome_heading()}</h2>
        <p>${m.email_greeting()},</p>
        <p>${m.email_welcome_thank_you()}</p>
        <p>${m.email_welcome_registered({ email })}</p>
        <p>${m.email_welcome_commitment()}</p>
        <br>
        <p>${m.email_closing()},<br>${m.email_company_team()}</p>
    `;

	return EmailLayout(content);
};
