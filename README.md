# XMPP Chat Client

This project is an XMPP (Extensible Messaging and Presence Protocol) chat client implemented in React. It provides a robust set of features for real-time communication, group chats, file sharing, and more.

![image](https://github.com/user-attachments/assets/c65500ea-deeb-4d28-bf35-6021a25f4bd5)

## Features

### Account Management (20%)
1. Register a new account on the server
2. Log in with an existing account
3. Log out from an account
4. Delete the account from the server

### Communication (80%)
1. Display all contacts and their status
2. Add a user to contacts
3. Show contact details of a user
4. One-on-one communication with any user/contact
5. Participate in group conversations
6. Set presence message
7. Send/receive notifications
8. Send/receive files

## Additional Features

- **Bookmarks**: Bookmark groups for easy access and auto-join
- **Customizable Groups**: Create public or private groups with custom settings
- **Real-time Updates**: Live updates for messages, presence, and group changes
- **Message History**: Retrieve and display message history
- **Unread Message Counters**: Track unread messages for each conversation
- **Custom Status Messages**: Set personalized status messages
- **Profile Pictures**: Support for user profile pictures

## Installation

To install and run this XMPP client on your local machine, follow these steps:

1. Ensure you have Node.js (version 14 or later) and npm installed on your system.

2. Clone the repository:
   ```
   git clone https://github.com/yourusername/xmpp-chat-client.git
   cd xmpp-chat-client
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your XMPP server configuration:
   ```
    VITE_SERVICE=wss://yourserver.com:7443/ws
    VITE_DOMAIN=yourserver.com
    VITE_RESOURCE=
    VITE_MUC_SERVICE=conference.yourserver.com
    VITE_UPLOAD_SERVICE=httpfileupload.yourserver.com
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to [http://localhost:5173/](http://localhost:5173/) to use the XMPP client.

## Usage

### Account Management
- **Register**: On the initial screen, provide a username and password, then click "Register".
- **Login**: Enter your credentials and click "Login".
- **Logout**: Click the logout button to end your session and return to the login screen.
- **Delete Account**: Access account settings to delete your account (use with caution).

### Contacts and Communication
- **View Contacts**: Your contact list displays all contacts and their current status.
- **Add Contact**: Click "Add Contact" and enter the user's Jabber ID (JID).
- **Contact Details**: Select a contact to view their details, including subscription status.
- **One-on-One Chat**: Click on a contact to start a private conversation.
- **Send Message**: Type your message and press Enter or click the send button.

### Group Chats
- **Create Group**: Click "Create Group", provide a name, and set privacy options.
- **Join Group**: Use "Join Group" and enter the group's JID.
- **Participate**: Send messages in group chats similar to one-on-one conversations.
- **Invite Users**: Invite contacts to join your groups.

### Presence and Status
- **Set Status**: Click on your avatar to open the status menu.
- **Custom Message**: Set a custom status message to display to your contacts.

### File Sharing
- **Send File**: In a chat, click the attachment button to select and upload a file.
- **Receive File**: Incoming files will appear as links in the chat.

### Notifications
- **Message Alerts**: Receive visual and audio notifications for new messages.
- **Subscription Requests**: Handle incoming contact requests from the notifications panel.

## Troubleshooting

- If you encounter connection issues, ensure your XMPP server details in the `.env` file are correct.
- For file upload problems, verify that your XMPP server supports HTTP File Upload (XEP-0363).
- If messages are not sending, check your internet connection and the XMPP server status.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## Acknowledgments

- [jakobhoeg](https://github.com/jakobhoeg/shadcn-chat) for the customizable and re-usable chat component used as the base UI.
- Sound Effect by [Luca Di Alessandro](https://pixabay.com/users/lucadialessandro-25927643/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180637) from [Pixabay](https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180637) used as notification sound.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
