import './App.css';
import FileUploader from './components/FileUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>文件分片上传</h1>
        <p>支持断点续传和上传进度显示</p>
      </header>
      <main className="App-main">
        <FileUploader />
      </main>
    </div>
  );
}

export default App;
