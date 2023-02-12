import "./App.css";
import UploadFiles from "./components/upload-files.component";

function App() {
  return (
    <div
      className="Maincontainer"
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      <div
        className="container"
        style={{ width: "600px", display: "flex", flexDirection: "column" }}
      >
        <div style={{ margin: "20px 0" }}>
          <h3>Finkraft.ai</h3>
          <h4>React Drag & Drop File Upload example</h4>
        </div>

        <UploadFiles />
      </div>
    </div>
  );
}

export default App;
