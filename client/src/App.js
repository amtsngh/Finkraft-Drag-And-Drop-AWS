import "./App.css";
import UploadFiles from "./components/upload-files.component";

function App() {
  return (
    <div
      className="Maincontainer"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        maxHeight: "750px",
      }}
    >
      <UploadFiles />
    </div>
  );
}

export default App;
