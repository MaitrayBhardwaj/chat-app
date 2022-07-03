import { useState } from "react"

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, orderBy, limit, query } from 'firebase/firestore' 
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from 'react-firebase-hooks/firestore'

import { FaPaperPlane, FaGoogle } from 'react-icons/fa'

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

const auth = getAuth()
const db = getFirestore(app)

function App() {
	const [user] = useAuthState(auth)
	return (
   		<div className="App">
	   		<header className="header"> Chat App <SignOut /></header>
   			<main className="main">
   				{ user ? <Chatroom /> : <SignIn /> }
   			</main>
	    </div>
  	)
}

function SignIn () {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider()
		signInWithPopup(auth, provider)
	}

	return (
		<button className="signin" onClick={signInWithGoogle}><FaGoogle />Sign In with Google</button>
	)
}

function Chatroom () {
	const q = query(collection(db, 'messages'), orderBy("createdAt"), limit(20));
	const [value] = useCollection(q, { snapshotListenOptions: { includeMetadataChanges: true } });

	const [formData, setFormData] = useState('')

	const sendMessage = async (ev) => {
		ev.preventDefault()
		await addDoc(collection(db, "messages"), {
			text: formData,
			createdAt: new Date(),
			uid: auth.currentUser.uid,
			photoURL: auth.currentUser.photoURL
	 	});
	 	setFormData('')
	}

	return (
		<div className="chat-room">
			<div className="messages">
				{ value ? value.docs.map(message => (<ChatMessage key={message.id} msg={message.data()} />)) : '' }
			</div>
			<form className="send-msg" onSubmit={sendMessage}>
				<input type="text" 
					className="msg-text" 
					value={formData}
					onChange={(ev) => setFormData(ev.target.value)} />
				<button className="send-btn"><FaPaperPlane /></button>
			</form>
		</div>
	)
}

function ChatMessage (props) {
	const { text, photoURL, uid } = props.msg
	return (
		<div className={`message ${ uid === auth.currentUser.uid ? "sentFromMe" : ''}`}>
			<img src={photoURL} className="avatar" alt="User Avatar" />
			<p className="msg">{text}</p>
		</div>
	)
}

function SignOut () {
	return auth.currentUser && (
		<button className="signout" onClick={() => auth.signOut()}>Sign Out</button>
	)
}

export default App;
