import { EmailLayout } from './layout';

export const PasswordResetEmailTemplate = (resetLink: string) => {
	const content = `
        <h2>Permintaan Reset Password</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset password akun Anda di SV ERP System.</p>
        <p>Jika Anda meminta ini, silakan klik tombol di bawah ini untuk membuat password baru:</p>
        <br>
        <a href="${resetLink}" class="button" style="color: #ffffff;">Reset Password Saya</a>
        <br><br>
        <p style="font-size: 14px; color: #888888;">Atau salin tautan berikut ke browser Anda:<br>
        <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a></p>
        <br>
        <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini. Akun Anda tetap aman.</p>
    `;

	return EmailLayout(content, 'Reset Password');
};
