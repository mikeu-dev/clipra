/**
 * Simulates a Hikvision Event Notification
 * Usage: bun scripts/test_hikvision_event.ts
 */

const ENDPOINT = 'http://localhost:5173/api/integrations/hikvision/events';

const xmlPayload = `
<EventNotificationAlert version="2.0" xmlns="http://www.hikvision.com/ver20/XMLSchema">
    <ipAddress>192.168.1.5</ipAddress>
    <dateTime>${new Date().toISOString()}</dateTime>
    <activePostCount>1</activePostCount>
    <eventType>AccessControlEvent</eventType>
    <eventState>active</eventState>
    <eventDescription>Access Control Event</eventDescription>
    <AccessControllerEvent>
        <deviceName>Front Door</deviceName>
        <majorEventType>0x5</majorEventType>
        <subEventType>0x4b</subEventType> 
        <employeeNoString>EMP001</employeeNoString>
        <name>Test Employee</name>
    </AccessControllerEvent>
</EventNotificationAlert>
`;

// Simulate Multipart Request
// In Node/Bun, we can construct a multipart body manually or use FormData.
// Bun has built-in FormData support.

const formData = new FormData();
formData.append('event_log', xmlPayload);
// formData.append('picture', new Blob(['fake image']), 'snap.jpg');

async function main() {
	console.log(`Sending event to ${ENDPOINT}...`);
	try {
		const res = await fetch(ENDPOINT, {
			method: 'POST',
			body: formData
		});

		const text = await res.text();
		console.log('Status:', res.status);
		console.log('Response:', text);
	} catch (e) {
		console.error('Error:', e);
	}
}

main();
