import { useState, useEffect } from "react";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { storage, db } from "./firebase";

function App() {
  const [selectedGrade, setSelectedGrade] = useState(null);

  const [grade1, setGrade1] = useState([]);
  const [grade2, setGrade2] = useState([]);
  const [grade3, setGrade3] = useState([]);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const querySnapshot = await getDocs(collection(db, "posts"));

    const posts = querySnapshot.docs.map((doc) => doc.data());

    setGrade1(
      posts
        .filter((post) => post.grade === 1)
        .map((post) => post.imageUrl)
    );

    setGrade2(
      posts
        .filter((post) => post.grade === 2)
        .map((post) => post.imageUrl)
    );

    setGrade3(
      posts
        .filter((post) => post.grade === 3)
        .map((post) => post.imageUrl)
    );
  }

  async function handleImage(event, grade) {
    const file = event.target.files[0];

    if (!file) return;

    const imageRef = ref(storage, Date.now() + file.name);

    await uploadBytes(imageRef, file);

    const url = await getDownloadURL(imageRef);

    await addDoc(collection(db, "posts"), {
      imageUrl: url,
      grade: grade,
    });

    loadImages();
  }

  function renderImages(images) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt="uploaded"
          style={{
            width: "100%",
            borderRadius: "16px",
            boxShadow: "0 4px 10px rgba(70, 27, 27, 0.3)",
          }}
        />
      ))}
    </div>
  );
}
  const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  fontSize: "18px",
  cursor: "pointer",
};
  return (
  <div
    style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      color: "white",
      padding: "40px",
      fontFamily: "Arial",
    }}
  >
    <h1
      style={{
        textAlign: "center",
        fontSize: "40px",
        marginBottom: "40px",
      }}
    >
      창조 학급 게시판
    </h1>

    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "40px",
      }}
    >
      <button
        onClick={() => setSelectedGrade(1)}
        style={buttonStyle}
      >
        1학년
      </button>

      <button
        onClick={() => setSelectedGrade(2)}
        style={buttonStyle}
      >
        2학년
      </button>

      <button
        onClick={() => setSelectedGrade(3)}
        style={buttonStyle}
      >
        3학년
      </button>
    </div>

    {selectedGrade === 1 && (
      <div>
        <h2>1학년 게시판</h2>

        <input
          type="file"
          onChange={(event) => handleImage(event, 1)}
        />

        {renderImages(grade1)}
      </div>
    )}

    {selectedGrade === 2 && (
      <div>
        <h2>2학년 게시판</h2>

        <input
          type="file"
          onChange={(event) => handleImage(event, 2)}
        />

        {renderImages(grade2)}
      </div>
    )}

    {selectedGrade === 3 && (
      <div>
        <h2>3학년 게시판</h2>

        <input
          type="file"
          onChange={(event) => handleImage(event, 3)}
        />

        {renderImages(grade3)}
      </div>
    )}
  </div>
);
}

export default App;