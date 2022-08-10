<h2>Real Time Chat Web Application</h2>

Live Site: https://real-time-chat-web-app.netlify.app

Key Points:
- This real-time chat application allows users to communicate with one another in real-time via messaging. 
- Firstly, users need to register using email and other information and then log in. Earlier, the registered user would directly login, and they could also log out after completing their chat. 
- Users can send images and emojis as well as texts. Users can also see which friends are active or not, and they can also see if their messages are delivered, seen, or unseen. Users can also search for their friends.

Technologies Used:
- JavaScript
- React
- Node
- Express
- MongoDB ( Database )
- Redux
- JWT
- Axios
- Socket.io
- Sass

API: https://fierce-bastion-47070.herokuapp.com

About API Integration and Redux:
- I did all CRUD operations with the above API from the frontend. I used the API with redux, so I sent data from the action to the reducer. In action, I maintained the API's CRUD operation during the pass data to the reducer using dispatch and payload method. After that, the reducer updates the state with payload data. Here I have basically divided the action and reducer into two parts.

Action:
- authAction - used for login and registration
- messengerAction - used for messaging, all about friends' information, and socket.io setup

Reducer:
- authReducer - state update with login/registration
- messengerReducer - state update with messaging
