import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { fas, faPaperPlane, faArrowLeft, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAJsXu-O_bCElmM2TcPYhsDkO_C1tPeX-k",
  authDomain: "technical-education-news-chat.firebaseapp.com",
  projectId: "technical-education-news-chat",
  storageBucket: "technical-education-news-chat.appspot.com",
  messagingSenderId: "816297685581",
  appId: "1:816297685581:web:948a4bdc9c078e5bbae204",
  measurementId: "G-S0882FNBDC"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>
          <a href='https://tsc-education-news.netlify.app/more/'><FontAwesomeIcon icon={faArrowLeft} style={{color: "#fff", marginLeft: "20px",}}  /></a>
        </h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
      <FontAwesomeIcon icon={faGoogle} size='lg' style={{color: "#000", marginRight: "20px",}} />
        Sign in with Google
      </button>
      <p class="warning-msg">Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}><FontAwesomeIcon icon={faRightFromBracket} style={{marginRight: "5px",}} />Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(40);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message" />

      <button type="submit" disabled={!formValue}>
        <FontAwesomeIcon icon={faPaperPlane} size='lg' style={{color: "#000",}} />
      </button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <dev class= "msg-p">
        <p>{displayName}</p>
        <dev class="msg-i">
          <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
          <p>{text}</p>
        </dev>
      </dev>
    </div>
  </>)
}


export default App;
