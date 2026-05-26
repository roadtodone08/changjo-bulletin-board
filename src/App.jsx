import { useState, useEffect, useRef } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { storage, db } from "./firebase";

const GRADES = [
  { id: 1, label: "1학년" },
  { id: 2, label: "2학년" },
  { id: 3, label: "3학년" },
];

const SUBJECTS = [
  { id: "korean", label: "국어", emoji: "📖" },
  { id: "english", label: "영어", emoji: "🌐" },
  { id: "math", label: "수학", emoji: "📐" },
  { id: "social", label: "사회", emoji: "🌍" },
  { id: "science", label: "과학", emoji: "🔬" },
];

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #f0f0f5;
    font-family: 'Noto Sans KR', sans-serif;
    min-height: 100vh;
  }

  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    padding-bottom: 40px;
  }

  /* ── Header ── */
  .header {
    padding: 40px 20px 24px;
    text-align: center;
    position: relative;
  }
  .header::after {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, #3b82f6 40%, #8b5cf6 60%, transparent);
    margin-top: 24px;
  }
  .header-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 4px;
    color: #3b82f6;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .header-title {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 30%, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Grade Tabs ── */
  .grade-tabs {
    display: flex;
    gap: 8px;
    padding: 20px 20px 0;
  }
  .grade-tab {
    flex: 1;
    padding: 10px 0;
    border: 1px solid #1e1e2e;
    border-radius: 10px;
    background: #111118;
    color: #64748b;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .grade-tab:hover { border-color: #3b82f6; color: #94a3b8; }
  .grade-tab.active {
    background: #1d2d50;
    border-color: #3b82f6;
    color: #fff;
    font-weight: 700;
  }

  /* ── Subject Tabs ── */
  .subject-tabs {
    display: flex;
    gap: 0;
    padding: 16px 20px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .subject-tabs::-webkit-scrollbar { display: none; }
  .subject-tab {
    flex-shrink: 0;
    padding: 8px 14px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: #475569;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .subject-tab:hover { color: #94a3b8; }
  .subject-tab.active {
    color: #fff;
    border-bottom-color: #8b5cf6;
    font-weight: 700;
  }

  /* ── Upload Card ── */
  .upload-card {
    margin: 16px 20px 0;
    background: #111118;
    border: 1px solid #1e1e2e;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .caption-input {
    background: #0a0a0f;
    border: 1px solid #1e1e2e;
    border-radius: 10px;
    padding: 10px 14px;
    color: #f0f0f5;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .caption-input::placeholder { color: #334155; }
  .caption-input:focus { border-color: #3b82f6; }

  .upload-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .file-label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #0a0a0f;
    border: 1px dashed #1e1e2e;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    transition: border-color 0.2s;
    font-size: 12px;
    color: #475569;
    overflow: hidden;
  }
  .file-label:hover { border-color: #3b82f6; color: #94a3b8; }
  .file-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file-input { display: none; }

  .upload-btn {
    padding: 10px 18px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s, transform 0.1s;
    flex-shrink: 0;
  }
  .upload-btn:hover { opacity: 0.85; }
  .upload-btn:active { transform: scale(0.97); }
  .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .upload-btn.loading { opacity: 0.6; }

  /* ── Progress Bar ── */
  .progress-bar {
    height: 2px;
    background: #1e1e2e;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    animation: progress-anim 1.2s ease-in-out infinite;
    width: 60%;
  }
  @keyframes progress-anim {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(220%); }
  }

  /* ── Image Grid ── */
  .grid-section {
    padding: 16px 20px 0;
  }
  .grid-count {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #334155;
    letter-spacing: 2px;
    margin-bottom: 12px;
  }
  .image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .image-card {
    background: #111118;
    border: 1px solid #1e1e2e;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
  }
  .image-card:hover { transform: translateY(-2px); border-color: #3b82f6; }
  .image-card img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }
  .image-caption {
    padding: 8px 10px;
    font-size: 11px;
    color: #64748b;
    border-top: 1px solid #1a1a28;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .image-caption.has-text { color: #94a3b8; }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    padding: 48px 20px;
    color: #1e293b;
  }
  .empty-state .big { font-size: 36px; margin-bottom: 8px; }
  .empty-state .msg { font-size: 13px; color: #334155; }

  /* ── Lightbox ── */
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    cursor: pointer;
  }
  .lightbox img {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 12px;
    object-fit: contain;
  }
  .lightbox-caption {
    margin-top: 14px;
    font-size: 14px;
    color: #94a3b8;
    text-align: center;
  }
  .lightbox-close {
    position: absolute;
    top: 20px; right: 20px;
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #1e1e2e;
    border: none;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
`;

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("korean");
  const [grade1, setGrade1] = useState([]);
  const [grade2, setGrade2] = useState([]);
  const [grade3, setGrade3] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Upload state
  const [caption, setCaption] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts = querySnapshot.docs.map((doc) => doc.data());
    setGrade1(posts.filter((post) => post.grade === 1));
    setGrade2(posts.filter((post) => post.grade === 2));
    setGrade3(posts.filter((post) => post.grade === 3));
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setPendingFileName(file.name);
  }

  async function handleUpload() {
    if (!pendingFile || uploading) return;
    setUploading(true);
    try {
      const imageRef = ref(storage, Date.now() + pendingFile.name);
      await uploadBytes(imageRef, pendingFile);
      const url = await getDownloadURL(imageRef);
      await addDoc(collection(db, "posts"), {
        imageUrl: url,
        grade: selectedGrade,
        subject: selectedSubject,
        caption: caption.trim(),
      });
      setPendingFile(null);
      setPendingFileName("");
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadImages();
    } finally {
      setUploading(false);
    }
  }

  function getPostsForView() {
    const gradeData = selectedGrade === 1 ? grade1 : selectedGrade === 2 ? grade2 : grade3;
    return gradeData.filter((p) => p.subject === selectedSubject);
  }

  function renderImages(posts) {
    if (posts.length === 0) {
      return (
        <div className="empty-state">
          <div className="big">📂</div>
          <div className="msg">아직 업로드된 자료가 없습니다</div>
        </div>
      );
    }
    return (
      <div className="image-grid">
        {posts.map((post, index) => (
          <div
            key={index}
            className="image-card"
            onClick={() => setSelectedImage(post)}
          >
            <img src={post.imageUrl} alt="uploaded" />
            <div className={`image-caption ${post.caption ? "has-text" : ""}`}>
              {post.caption || "제목 없음"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const currentPosts = selectedGrade ? getPostsForView() : [];

  return (
    <>
      <style>{style}</style>
      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="header-tag">SCHOOL BOARD</div>
          <div className="header-title">창조 학급 게시판</div>
        </div>

        {/* Grade Tabs */}
        <div className="grade-tabs">
          {GRADES.map((g) => (
            <button
              key={g.id}
              className={`grade-tab ${selectedGrade === g.id ? "active" : ""}`}
              onClick={() => setSelectedGrade(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        {selectedGrade && (
          <>
            {/* Subject Tabs */}
            <div className="subject-tabs">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  className={`subject-tab ${selectedSubject === s.id ? "active" : ""}`}
                  onClick={() => setSelectedSubject(s.id)}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            {/* Upload Card */}
            <div className="upload-card">
              <input
                className="caption-input"
                type="text"
                placeholder="작품 제목 또는 설명을 입력하세요"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="upload-row">
                <label className="file-label">
                  <span>📎</span>
                  <span>{pendingFileName || "사진 선택"}</span>
                  <input
                    ref={fileInputRef}
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <button
                  className={`upload-btn ${uploading ? "loading" : ""}`}
                  onClick={handleUpload}
                  disabled={!pendingFile || uploading}
                >
                  {uploading ? "올리는 중…" : "업로드"}
                </button>
              </div>
              {uploading && (
                <div className="progress-bar">
                  <div className="progress-fill" />
                </div>
              )}
            </div>

            {/* Image Grid */}
            <div className="grid-section">
              <div className="grid-count">
                {currentPosts.length} POSTS
              </div>
              {renderImages(currentPosts)}
            </div>
          </>
        )}

        {!selectedGrade && (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <div className="big">🏫</div>
            <div className="msg">학년을 선택하면 게시판이 열립니다</div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close">✕</button>
          <img src={selectedImage.imageUrl} alt="full" />
          {selectedImage.caption && (
            <div className="lightbox-caption">{selectedImage.caption}</div>
          )}
        </div>
      )}
    </>
  );
}