# XMPP Chat Client

This project is an XMPP (Extensible Messaging and Presence Protocol) chat client implemented in React. It provides a robust set of features for real-time communication, group chats, file sharing, and more.

## Features

1. **User Authentication**

   - Register new XMPP accounts
   - Log in to existing accounts
   - Delete user accounts

2. **Contact Management**

   - Add contacts
   - Accept/deny subscription requests
   - Remove contacts
   - Toggle online status sharing

3. **Messaging**

   - Send and receive one-on-one messages
   - Real-time message updates
   - Message history retrieval

4. **Group Chats**

   - Create new groups
   - Join existing groups
   - Send and receive group messages
   - Invite users to groups
   - Leave groups

5. **File Sharing**

   - Upload and share files in chats

6. **Presence**

   - Set user status (away, chat, do not disturb, extended away)
   - Set custom status messages

7. **Bookmarks**

   - Bookmark groups for easy access
   - Auto-join bookmarked rooms

8. **Notifications**
   - Display notifications for new messages
   - Show unread message counts

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

1. **Registration and Login**

   - On the initial screen, you can either register a new account or log in to an existing one.
   - To register, provide a username and password, then click "Register".
   - To log in, enter your credentials and click "Login".

2. **Managing Contacts**

   - To add a contact, click the "Add Contact" button and enter the user's JID (Jabber ID).
   - Accept or deny incoming subscription requests from the notifications panel.
   - Remove a contact by selecting them and clicking the "Remove Contact" button.

3. **Sending Messages**

   - Select a contact from the contact list to open a chat.
   - Type your message in the input field and press Enter or click the send button.

4. **Group Chats**

   - Create a new group by clicking "Create Group" and providing a name.
   - Join an existing group by clicking "Join Group" and entering the group's JID.
   - Send group messages similar to one-on-one chats.

5. **File Sharing**

   - In a chat, click the attachment button to select and upload a file.
   - Once uploaded, the file link will be sent in the chat.

6. **Setting Status**

   - Click on your avatar or username to open the status menu.
   - Select a predefined status or set a custom status message.

7. **Bookmarks**

   - Bookmark a group chat by clicking the bookmark icon in the group chat window.
   - Access bookmarked chats from the bookmarks panel.

8. **Logging Out**
   - Click the logout button to end your session and return to the login screen.

## Troubleshooting

- If you encounter connection issues, ensure your XMPP server details in the `.env` file are correct.
- For file upload problems, verify that your XMPP server supports HTTP File Upload (XEP-0363).
- If messages are not sending, check your internet connection and the XMPP server status.

## Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.

## Aknowledgments

- [jakobhoeg](https://github.com/jakobhoeg/shadcn-chat) for his amazing customizable and re-usable chat component that was used as base UI.
- Sound Effect by <a href="https://pixabay.com/users/lucadialessandro-25927643/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180637">Luca Di Alessandro</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=180637">Pixabay</a> used as notification sound.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
